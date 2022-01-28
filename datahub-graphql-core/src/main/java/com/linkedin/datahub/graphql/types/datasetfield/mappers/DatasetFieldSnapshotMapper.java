package com.linkedin.datahub.graphql.types.datasetfield.mappers;

import com.linkedin.datahub.graphql.generated.DatasetField;
import com.linkedin.datahub.graphql.generated.EntityType;
import com.linkedin.datahub.graphql.types.mappers.ModelMapper;
import com.linkedin.metadata.snapshot.DatasetFieldSnapshot;

import javax.annotation.Nonnull;


public class DatasetFieldSnapshotMapper implements ModelMapper<DatasetFieldSnapshot, DatasetField> {

    public static final DatasetFieldSnapshotMapper INSTANCE = new DatasetFieldSnapshotMapper();

    public static DatasetField map(@Nonnull final DatasetFieldSnapshot datasetField) {
        return INSTANCE.apply(datasetField);
    }

    @Override
    public DatasetField apply(@Nonnull final DatasetFieldSnapshot datasetField) {
        DatasetField result = new DatasetField();
        result.setUrn(datasetField.getUrn().toString());
        result.setType(EntityType.DATASET);

        return result;
    }
}
