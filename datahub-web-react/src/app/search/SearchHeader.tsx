import * as React from 'react';
import { Image, Layout } from 'antd';
import { Link } from 'react-router-dom';
import { useParams, useLocation } from 'react-router';
import styled, { useTheme } from 'styled-components';

import { SearchBar } from './SearchBar';
import { AutoCompleteResultForEntity, EntityType } from '../../types.generated';
import EntityRegistry from '../entity/EntityRegistry';
import { ANTD_GRAY } from '../entity/shared/constants';
import { AdminHeaderLinks } from '../shared/admin/AdminHeaderLinks';
import { LegacyBrowsePath } from '../browse/LegacyBrowsePath';

const { Header } = Layout;

const styles = {
    header: {
        position: 'fixed',
        zIndex: 1,
        width: '100%',
        lineHeight: '60px',
        padding: '0px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${ANTD_GRAY[4.5]}`,
    },
};

const LogoImage = styled(Image)`
    display: inline-block;
    height: 32px;
    width: auto;
    margin-top: 2px;
`;

const LogoSearchContainer = styled.div`
    display: flex;
    flex: 1;
    align-items: center;
`;

const NavGroup = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 200px;
`;

type Props = {
    initialQuery: string;
    placeholderText: string;
    suggestions: Array<AutoCompleteResultForEntity>;
    onSearch: (query: string, type?: EntityType) => void;
    onQueryChange: (query: string) => void;
    entityRegistry: EntityRegistry;
};

type BrowseResultsPageParams = {
    type: string;
};

const defaultProps = {};

/**
 * A header containing a Logo, Search Bar view, & an account management dropdown.
 */
export const SearchHeader = ({
    initialQuery,
    placeholderText,
    suggestions,
    onSearch,
    onQueryChange,
    entityRegistry,
}: Props) => {
    const themeConfig = useTheme();
    const location = useLocation();

    const { type } = useParams<BrowseResultsPageParams>();

    let entityType;

    if (type) {
        entityType = entityRegistry.getTypeFromPathName(type);
    }

    const rootPath = location.pathname;
    const path = rootPath.split('/').slice(3);

    return (
        <Header style={styles.header as any}>
            <LogoSearchContainer>
                <Link to="/" style={{ marginRight: '30px' }}>
                    <LogoImage src={themeConfig.assets.logoUrl} preview={false} />
                </Link>

                {type && <LegacyBrowsePath type={entityType} path={path} isBrowsable />}

                <SearchBar
                    initialQuery={initialQuery}
                    placeholderText={placeholderText}
                    suggestions={suggestions}
                    onSearch={onSearch}
                    onQueryChange={onQueryChange}
                    entityRegistry={entityRegistry}
                />
            </LogoSearchContainer>
            <NavGroup>
                <AdminHeaderLinks />
            </NavGroup>
        </Header>
    );
};

SearchHeader.defaultProps = defaultProps;
