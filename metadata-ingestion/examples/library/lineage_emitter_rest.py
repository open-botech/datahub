import datahub.emitter.mce_builder as builder
from datahub.emitter.rest_emitter import DatahubRestEmitter

# Construct a lineage object.
lineage_mce = builder.make_lineage_mce(
    [
        builder.make_dataset_urn("elasticsearch", "hb-3wheel-recognition-2001-01"),
        builder.make_dataset_urn("elasticsearch", "hb-3wheel-recognition-2001-02"),

    ],
    builder.make_dataset_urn("elasticsearch", "hb-3wheel-recognition-2021-09"),
)

# Create an emitter to the GMS REST API.
emitter = DatahubRestEmitter("http://localhost:8080")

# Emit metadata!
emitter.emit_mce(lineage_mce)
