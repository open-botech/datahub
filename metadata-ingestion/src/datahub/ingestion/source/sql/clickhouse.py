
from datahub.ingestion.source.sql.sql_common import (
    BasicSQLAlchemyConfig,
    SQLAlchemySource,
)


class ClickhouseConfig(BasicSQLAlchemyConfig):
    # defaults
    host_port = "localhost:8123"
    scheme = "clickhouse"


class ClickhouseSource(SQLAlchemySource):
    def __init__(self, config, ctx):
        super().__init__(config, ctx, "clickhouse")

    @classmethod
    def create(cls, config_dict, ctx):
        config = ClickhouseConfig.parse_obj(config_dict)
        return cls(config, ctx)
