import {Link} from 'react-router';

export default function Index() {
  return (
    <div className="mx-auto p-12 grid grid-cols-1 gap-4">
      <p>
        <Link className="text-blue-500 underline" to="/collections/all">
          All Products
        </Link>
      </p>
    </div>
  );
}