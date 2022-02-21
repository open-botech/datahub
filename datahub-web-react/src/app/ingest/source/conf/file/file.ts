import { SourceConfig } from '../types';

const baseUrl = window.location.origin;

const placeholderRecipe = `\
source:
  type: file
  config:
    # Coordinates
    filename: ./path/to/mce/file.json

sink:
  # sink configs

    type: datahub-rest 
    config: 
        server: "${baseUrl}/api/gms"`;

const fileConfig: SourceConfig = {
    type: 'file',
    placeholderRecipe,
    displayName: 'File',
    docsUrl: 'https://datahubproject.io/docs/metadata-ingestion/source_docs/file/',
};

export default fileConfig;
