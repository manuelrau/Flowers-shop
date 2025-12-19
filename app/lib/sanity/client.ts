import {createClient} from '@sanity/client';

export const sanityClient = createClient({
  projectId: 'yxp6rvwn',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2023-03-01',
});
