package com.linkedin.datahub.graphql.types.datasetfield;

import com.linkedin.common.urn.DatasetFieldUrn;

import java.net.URISyntaxException;


public class DatasetFieldUtils {

    private DatasetFieldUtils() { }

    static DatasetFieldUrn getDatasetFieldUrn(String urnStr) {
        try {
            return DatasetFieldUrn.createFromString(urnStr);
        } catch (URISyntaxException e) {
            throw new RuntimeException(String.format("Failed to retrieve dataset with urn %s, invalid urn", urnStr));
        }
    }
}
