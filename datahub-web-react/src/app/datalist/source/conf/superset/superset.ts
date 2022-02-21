import { SourceConfig } from '../types';
import supersetLogo from '../../../../../images/supersetlogo.png';
import icon from '../../../../../images/superset.png';

const baseUrl = window.location.origin;

const placeholderRecipe = `\
source:
  type: superset
  config:
    # Coordinates
    connect_uri: http://localhost:8088

    # Credentials
    username: user
    password: pass
    provider: ldap

sink:
    # sink configs
    type: datahub-rest 
    config: 
        server: "${baseUrl}/api/gms"`;

const supersetConfig: SourceConfig = {
    type: 'superset',
    placeholderRecipe,
    displayName: 'Superset',
    logoUrl: supersetLogo,
    icon
};

export default supersetConfig;
