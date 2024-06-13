// import Breadcrumb from '../components/Breadcrumb';
import React from 'react';
import Entries from '../components/EntityList';

const Tables = () => {
  return (
    <>
      {/* <Breadcrumb pageName="Entity" /> */}

      <div className="flex flex-col gap-10">
        <Entries />
 
      </div>
    </>
  );
};

export default Tables;
