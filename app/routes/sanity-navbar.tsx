import type {LoaderFunctionArgs} from 'react-router';
import {useLoaderData} from 'react-router';
import {sanityClient} from '~/lib/sanity/client';
import {navbarQuery} from '~/lib/sanity/navbarQuery';
import {Header} from '~/components/Header';


export async function loader({}: LoaderFunctionArgs) {
  const navbar = await sanityClient.fetch(navbarQuery);
  console.log('SANITY NAVBAR TEST:', navbar);
  return new Response(JSON.stringify(navbar, null, 2), {
    headers: {'Content-Type': 'application/json'},
  });
}

// 2) Komponente: liest Loader-Daten mit useLoaderData
export default function NavTest() {
  const navbar = useLoaderData<any>(); // liest das JSON aus dem Loader

  console.log('NAVBAR IN COMPONENT:', navbar); // Browser-Console

  return (
    <Header
      header={
        // hier kurzfristig ein Dummy-Header, damit Header nicht crasht
        {shop: {name: 'Teeeest Shop'}} as any
      }
      cart={Promise.resolve(null)}
      isLoggedIn={Promise.resolve(false)}
      publicStoreDomain=""
      navbarItems={navbar?.items ?? []}
    />
  );
}
