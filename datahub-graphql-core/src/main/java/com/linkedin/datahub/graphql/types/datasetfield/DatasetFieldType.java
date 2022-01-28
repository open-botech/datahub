package com.linkedin.datahub.graphql.types.datasetfield;

import com.google.common.collect.ImmutableSet;
import com.linkedin.common.urn.DatasetFieldUrn;
import com.linkedin.common.urn.Urn;
import com.linkedin.datahub.graphql.QueryContext;
import com.linkedin.datahub.graphql.generated.*;
import com.linkedin.datahub.graphql.resolvers.ResolverUtils;
import com.linkedin.datahub.graphql.types.SearchableEntityType;
import com.linkedin.datahub.graphql.types.datasetfield.mappers.DatasetFieldSnapshotMapper;
import com.linkedin.datahub.graphql.types.mappers.AutoCompleteResultsMapper;
import com.linkedin.datahub.graphql.types.mappers.UrnSearchResultsMapper;
import com.linkedin.entity.Entity;
import com.linkedin.entity.client.EntityClient;
import com.linkedin.metadata.extractor.AspectExtractor;
import com.linkedin.metadata.query.AutoCompleteResult;
import com.linkedin.metadata.search.SearchResult;
import graphql.execution.DataFetcherResult;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import java.util.*;
import java.util.stream.Collectors;


public class DatasetFieldType implements SearchableEntityType<DatasetField> {

    private static final Set<String> FACET_FIELDS = ImmutableSet.of("origin", "platform");

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        private final EntityClient _datasetsFieldClient;

    public DatasetFieldType(final EntityClient datasetsFieldClient) {
        _datasetsFieldClient = datasetsFieldClient;
    }

    @Override
    public Class<DatasetField> objectClass() {
        return DatasetField.class;
    }


    @Override
    public List<DataFetcherResult<DatasetField>> batchLoad(final List<String> urns, final QueryContext context) {

        final List<DatasetFieldUrn> datasetFieldUrns = urns.stream()
                .map(DatasetFieldUtils::getDatasetFieldUrn)
                .collect(Collectors.toList());

        try {
            final Map<Urn, Entity> datasetFieldMap = _datasetsFieldClient.batchGet(datasetFieldUrns
                    .stream()
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet()), context.getAuthentication());

            final List<Entity> gmsResults = new ArrayList<>();
            for (DatasetFieldUrn urn : datasetFieldUrns) {
                gmsResults.add(datasetFieldMap.getOrDefault(urn, null));
            }
            return gmsResults.stream()
                .map(gmsDatasetField ->
                    gmsDatasetField == null ? null : DataFetcherResult.<DatasetField>newResult()
                        .data(DatasetFieldSnapshotMapper.map(gmsDatasetField.getValue().getDatasetFieldSnapshot()))
                        .localContext(AspectExtractor.extractAspects(gmsDatasetField.getValue().getDatasetFieldSnapshot()))
                        .build()
                )
                .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to batch load DatasetFields", e);
        }
    }

    @Override
    public EntityType type() {
        return EntityType.DATASET_FIELD;
    }

    @Override
    public SearchResults search(@Nonnull String query,
        @Nullable List<FacetFilterInput> filters,
        int start,
        int count,
        @Nonnull final QueryContext context) throws Exception {
        final Map<String, String> facetFilters = ResolverUtils.buildFacetFilters(filters, FACET_FIELDS);
        final SearchResult searchResult = _datasetsFieldClient.search("datasetField", query, facetFilters, start, count, context.getAuthentication());
        return UrnSearchResultsMapper.map(searchResult) ;
    }

    @Override
    public AutoCompleteResults autoComplete(@Nonnull String query,
        @Nullable String field,
        @Nullable List<FacetFilterInput> filters,
        int limit,
        @Nonnull final QueryContext context) throws Exception {
        final Map<String, String> facetFilters = ResolverUtils.buildFacetFilters(filters, FACET_FIELDS);
        final AutoCompleteResult result = _datasetsFieldClient.autoComplete("datasetField", query, facetFilters, limit, context.getAuthentication());
        return AutoCompleteResultsMapper.map(result);
    }
}
