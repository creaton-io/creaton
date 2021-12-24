import { Meta } from '../layout/Meta';
import { AppConfig } from '../utils/AppConfig';
import Layout from '../layout/Layout';
import { Footer } from './Footer';
import { VerticalFeatures } from './VerticalFeatures';

export default function Base() {

  return (
    <Layout>
      <div className="antialiased text-gray-600">
        <Meta title={AppConfig.title} description={AppConfig.description} />
        <VerticalFeatures />
        <Footer />
      </div>
    </Layout>
  )
}
