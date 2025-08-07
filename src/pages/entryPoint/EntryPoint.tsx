import React, { useState } from 'react';
import Cards from './Cards';
import ExampleModal from './ExampleModal';
import { useQueryBuilderContext } from '../../context/queryBuilder';
import cloneDeep from 'lodash/cloneDeep';
import { useNavigate } from '@tanstack/react-router';
import TemplateModal from './TemplateModal';

function EntryPoint() {
  const queryBuilder = useQueryBuilderContext();
  const navigate = useNavigate();

  const [savedState, setSavedState] = useState<any>(null);
  const [isExampleModalOpen, setExampleModalOpen] = useState(false);
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);

  const handleCancel = () => {
    if (savedState) {
      queryBuilder.dispatch({
        type: 'restoreGraph',
        payload: savedState,
      });
    }
  };

  const cardsData = [
    {
      icon: '/react-icons/fiBookOpen.svg',
      title: 'Start with an example',
      description: 'Select one of the existing queries from our set of examples provided',
      buttonText: 'View Examples',
      action: () => {
        setSavedState(cloneDeep(queryBuilder.query_graph));
        setExampleModalOpen(true);
      },
    },
    {
      icon: '/react-icons/cgTemplate.svg',
      title: 'Choose from Templates',
      description: 'Use any of the customizable templates available from the list',
      buttonText: 'Explore Templates',
      action: () => {
        setSavedState(cloneDeep(queryBuilder.query_graph));
        setTemplateModalOpen(true);
      },
    },
    {
      icon: '/react-icons/fiPenTool.svg',
      title: 'Create your own query',
      description: 'Start from scratch with what you need using our query builder',
      buttonText: 'Create Query',
      action: () => navigate({ to: '/question-builder' }),
    },
  ];
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '60px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <p style={{ fontSize: '30px', fontWeight: 400, margin: '0 8px 0 0' }}>Welcome to </p>
        <img src="/logo.svg" alt="Logo" />
      </div>
      <p style={{ color: '#5E5E5E', fontSize: '16px', textAlign: 'center', maxWidth: '900px' }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat.
      </p>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '32px', marginTop: '48px' }}>
        {cardsData.map((card, index) => (
          <Cards
            key={index}
            icon={card.icon}
            title={card.title}
            description={card.description}
            buttonText={card.buttonText}
            action={card.action}
          />
        ))}
      </div>
      <ExampleModal
        isOpen={isExampleModalOpen}
        onClose={() => setExampleModalOpen(false)}
        onCancel={handleCancel}
      />
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default EntryPoint;
