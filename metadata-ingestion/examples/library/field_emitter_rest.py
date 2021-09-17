import datahub.emitter.mce_builder as builder
from datahub.emitter.rest_emitter import DatahubRestEmitter

mce = builder.make_datasetfield_mce(
    builder.make_dataset_field_urn("clickhouse", "default.hb_face_recognition_kafka", "/DeviceID")
)

# Create an emitter to the GMS REST API.
emitter = DatahubRestEmitter("http://localhost:8080")

# Emit metadata!
emitter.emit_mce(mce)
