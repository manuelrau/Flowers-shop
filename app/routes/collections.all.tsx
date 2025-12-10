import {Link, useLoaderData, type LoaderFunctionArgs} from 'react-router';
import {type Product} from '@shopify/hydrogen/storefront-api-types';

export async function loader({
                               params,
                               context: {storefront},
                             }: LoaderFunctionArgs) {
  const {products} = await storefront.query<{
    products: {nodes: Product[]};
  }>(
      `#graphql
      query Products {
          products(first: 10) {
              nodes { id title handle }
          }
      }
    `,
  );

  if (!products.nodes.length) {
    throw new Response('Not found', {status: 404});
  }

  return {products: products.nodes};
}

export default function Index() {
  const {products} = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto p-12 grid grid-cols-1 gap-4">
      <h1 className="text-3xl font-bold">All Products</h1>
      {products.map((product) => (
        <p key={product.id}>
          <Link className="text-blue-500" to={`/products/${product.handle}`}>
            {product.title}
          </Link>
        </p>
      ))}
    </div>
  );
}