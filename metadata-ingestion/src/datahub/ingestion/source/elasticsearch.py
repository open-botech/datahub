import logging
from dataclasses import dataclass, field
from typing import Iterable, List, Optional

from elasticsearch import Elasticsearch


from datahub.configuration import ConfigModel
from datahub.configuration.common import AllowDenyPattern
from datahub.configuration.elasticsearch import ElasticsearchConnectionConfig
from datahub.emitter.mce_builder import DEFAULT_ENV
from datahub.ingestion.api.common import PipelineContext
from datahub.ingestion.api.source import Source, SourceReport
from datahub.ingestion.api.workunit import MetadataWorkUnit
from datahub.metadata.com.linkedin.pegasus2avro.metadata.snapshot import DatasetSnapshot
from datahub.metadata.com.linkedin.pegasus2avro.mxe import MetadataChangeEvent
from datahub.metadata.com.linkedin.pegasus2avro.schema import (
    SchemaField,
    SchemaMetadata,
)

from src.datahub.metadata.com.linkedin.pegasus2avro.schema import SchemaFieldDataType
from src.datahub.metadata.schema_classes import NumberTypeClass, BooleanTypeClass, StringTypeClass, DateTypeClass, NullTypeClass, SchemalessClass, DatasetPropertiesClass

logger = logging.getLogger(__name__)


class ElasticsearchSourceConfig(ConfigModel):
    env: str = DEFAULT_ENV
    # TODO: inline the connection config
    connection: ElasticsearchConnectionConfig = ElasticsearchConnectionConfig()
    index_patterns: AllowDenyPattern = AllowDenyPattern(allow=[".*"], deny=["^_.*"])


@dataclass
class ElasticsearchSourceReport(SourceReport):
    index_scanned: int = 0
    filtered: List[str] = field(default_factory=list)

    def report_index_scanned(self, index: str) -> None:
        self.index_scanned += 1

    def report_dropped(self, index: str) -> None:
        self.filtered.append(index)

_field_type_mapping: Dict[str, Type] = {
    "integer": NumberTypeClass,
    "boolean": BooleanTypeClass,
    "keyword": StringTypeClass,
    "date": DateTypeClass

}
def get_column_type(
        elasticsearch_report: ElasticsearchSourceReport, dataset_name: str, column_type: str
) -> SchemaFieldDataType:

    TypeClass: Optional[Type] = _field_type_mapping.get(column_type)
    if TypeClass is None:
        elasticsearch_report.report_warning(
            dataset_name, f"unable to map type {column_type!r} to metadata schema"
        )
        TypeClass = NullTypeClass

    return SchemaFieldDataType(type=TypeClass())



@dataclass
class ElasticsearchSource(Source):
    source_config: ElasticsearchSourceConfig
    client: Elasticsearch
    report: ElasticsearchSourceReport

    def __init__(self, config: ElasticsearchSourceConfig, ctx: PipelineContext):
        super().__init__(ctx)
        self.source_config = config
        self.client = Elasticsearch(self.source_config.connection.host)
        self.report = ElasticsearchSourceReport()

    @classmethod
    def create(cls, config_dict, ctx):
        config = ElasticsearchSourceConfig.parse_obj(config_dict)
        return cls(config, ctx)

    def get_workunits(self) -> Iterable[MetadataWorkUnit]:
        indices = self.client.indices.get_alias("*")

        for t in indices:
            self.report.report_index_scanned(t)

            if self.source_config.index_patterns.allowed(t):
                mce = self._extract_record(t)
                wu = MetadataWorkUnit(id=f"index-{t}", mce=mce)
                self.report.report_workunit(wu)
                yield wu
            else:
                self.report.report_dropped(t)

    def _extract_record(self, index: str) -> MetadataChangeEvent:
        logger.debug(f"index = {index}")
        platform = "elasticsearch"
        dataset_name = index

        dataset_snapshot = DatasetSnapshot(
            urn=f"urn:li:dataset:(urn:li:dataPlatform:{platform},{dataset_name},{self.source_config.env})",
            aspects=[],  # we append to this list later on
        )
        dataset_properties = DatasetPropertiesClass(
            tags=[],
            customProperties={},
        )
        dataset_snapshot.aspects.append(dataset_properties)
        raw_data = self.client.indices.get_mapping( index );
        raw_schema = raw_data[ index ]["mappings"]["properties"]

        # initialize the schema for the collection
        canonical_schema: List[SchemaField] = []

        # append each schema field (sort so output is consistent)
        for columnName, column in raw_schema.items():
            schema_field = SchemaField(
                fieldPath=columnName,
                nativeDataType=get_column_type(self.report, dataset_name, column['type']),
                type=column['type'],
                description=None,
                nullable=True,
                recursive=False,
            )
            canonical_schema.append(schema_field)
        schema_metadata = SchemaMetadata(
          schemaName=index,
          platform=f"urn:li:dataPlatform:{platform}",
          version=0,
          hash="",
          platformSchema=SchemalessClass(),
          fields=canonical_schema,
        )
        dataset_snapshot.aspects.append(schema_metadata)

        metadata_record = MetadataChangeEvent(proposedSnapshot=dataset_snapshot)
        return metadata_record

    def get_report(self):
        return self.report

    def close(self):
        if self.consumer:
            self.consumer.close()
