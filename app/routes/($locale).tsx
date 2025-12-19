// app/routes/($locale).tsx

import type {LoaderFunctionArgs} from 'react-router';
import { useLoaderData} from 'react-router';
import {loader as rootLoader} from '~/root';
import {sanityClient} from '~/lib/sanity/client';
import {navbarQuery} from '~/lib/sanity/navbarQuery';
import {Header} from '~/components/Header';

function json<T>(data: T, init?: number | ResponseInit) {
  return new Response(JSON.stringify(data), {
    status: typeof init === 'number' ? init : init?.status ?? 200,
    headers: {
      'Content-Type': 'application/json',
      ...(typeof init === 'object' ? init.headers : {}),
    },
  });
}


// 1) Loader
export async function loader(args: LoaderFunctionArgs) {
  const [rootData, navbar] = await Promise.all([
    rootLoader(args),
    sanityClient.fetch(navbarQuery),
  ]);

  console.log('Sanity navbar in loader:', navbar); // Server-Log (Terminal)

  return json({
    ...rootData,
    navbar,
  });
}

// 2) Route-Komponente – HIER „derselben Route“
export default function IndexRoute() {

  const data = useLoaderData() as {
    header: any;
    cart: any;
    isLoggedIn: any;
    publicStoreDomain: string;
    navbar?: {items?: any[]};
  };

  const {header, cart, isLoggedIn, publicStoreDomain, navbar} =
    data;

  return (
    <>
      <Header
        header={header}
        cart={cart}
        isLoggedIn={isLoggedIn}
        publicStoreDomain={publicStoreDomain}
        navbarItems={navbar?.items ?? []}
      />
      {/* Rest der Seite */}
    </>
  );
}
