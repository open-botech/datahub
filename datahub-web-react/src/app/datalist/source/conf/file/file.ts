import { SourceConfig } from '../types';
import filelogo from '../../../../../images/filelogo.png';
import icon from '../../../../../images/file.png';

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
    logoUrl: filelogo,
    icon
};

export default fileConfig;
