import React from 'react';
import styled from 'styled-components';

import TagTermGroup from '../../../../../shared/tags/TagTermGroup';
import { SidebarHeader } from './SidebarHeader';
import { useEntityData, useRefetch } from '../../../EntityContext';

const TermSection = styled.div`
    margin-top: 20px;
`;

export const SidebarTagsSection = ({ properties }: { properties?: any }) => {
    const canAddTag = properties?.hasTags;
    const canAddTerm = properties?.hasTerms;

    const { urn, entityType, entityData } = useEntityData();

    const refetch = useRefetch();
    return (
        <div>
            <SidebarHeader title="标签" />
            <TagTermGroup
                editableTags={entityData?.globalTags}
                canAddTag={canAddTag}
                canRemove
                showEmptyMessage
                entityUrn={urn}
                entityType={entityType}
                refetch={refetch}
            />
            <TermSection>
                <SidebarHeader title="术语分类" />
                <TagTermGroup
                    editableGlossaryTerms={entityData?.glossaryTerms}
                    canAddTerm={canAddTerm}
                    canRemove
                    showEmptyMessage
                    entityUrn={urn}
                    entityType={entityType}
                    refetch={refetch}
                />
            </TermSection>
        </div>
    );
};
