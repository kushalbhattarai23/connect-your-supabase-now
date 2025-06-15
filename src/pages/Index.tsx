
import Landing from './Landing';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Track Hub – Dashboard Home</title>
        <meta name="description" content="Access your ultimate dashboard for entertainment and finance management." />
      </Helmet>
      <Landing />
    </>
  );
};

export default Index;
