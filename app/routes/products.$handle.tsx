import {Link, useLoaderData, type LoaderFunctionArgs} from 'react-router';
import {type Product} from '@shopify/hydrogen/storefront-api-types';
import {PortableText, type PortableTextBlock} from '@portabletext/react';
export async function loader({
                               params,
                               context: {storefront, sanity},
                             }: LoaderFunctionArgs) {
  const {product} = await storefront.query<{product: Product}>(
      `#graphql
      query Product($handle: String!) {
          product(handle: $handle) { id title }
      }
    `,
    {variables: params},
  );
  const PRODUCT_QUERY = `*[_type == "product" && store.slug.current == $handle][0]{
    body,
    "image": store.previewImageUrl
  }`;

  const initial = await sanity.fetch<{
    body: PortableTextBlock[] | null;
    image: string | null;
  } | null>(PRODUCT_QUERY, params, {
    tag: 'homepage',
    hydrogen: {debug: {displayName: 'query Homepage'}},
  });

  if (!initial) {
    throw new Response('Product not found', {status: 404});
  }

  return {product, initial};
}

export default function Product() {
  const {product, initial} = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto p-12">
      <h1 className="text-3xl font-bold">{product.title}</h1>
      {initial?.image ? (
        <img
          alt={product.title}
          src={initial.image}
          className="size-32 mb-6 mr-6 object-cover float-left rounded-xl"
        />
      ) : null}
      {Array.isArray(initial?.body) ? (
        <PortableText value={initial.body} />
      ) : null}
      <Link className="text-blue-500" to="/collections/all">
        &larr; Back to All Products
      </Link>
    </div>
  );
}