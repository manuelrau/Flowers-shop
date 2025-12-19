'use client';

import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import '../styles/tailwind.css';
import {useEffect, useState} from 'react';
import {sanityClient} from '~/lib/sanity/client';
import {navbarQuery} from '~/lib/sanity/navbarQuery';


type NavbarItem = {
  label: string;
  openInNewTab?: boolean;
  link?: any[]; // später gern genauer typisieren
};

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  navbarItems: NavbarItem[];
}


type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
  navbarItems,
}: HeaderProps) {
  const {shop, menu} = header;


  return (
    <header className="header">
      <NavLink className="w-full" prefetch="intent" to="/" style={activeLinkStyle} end>
        <div className="self-stretch inline-flex justify-evenly items-center w-full">
          <div className="self-stretch inline-flex justify-between items-center w-full">
            {shop.name.split(' ').map((word, index) => (
              <span key={index} className="text-black text-6xl font-normal font-['GT America']">

      {word}
    </span>
            ))}
          </div>
        </div>

      </NavLink>
      <HeaderMenuFromSanity items={navbarItems} />
      {/*
      <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
      {/*<HeaderCtas isLoggedIn={isLoggedIn} cart={cart} /> */}
    </header>
  );
}
function HeaderMenuFromSanity({items}: {items: NavbarItem[]}) {
  const {close} = useAside();

  return (
    <nav className="header-menu-desktop" role="navigation">
      {items?.map((item, idx) => {

        const navLink = item.link?.[0]; // wegen max(1) in deinem Schema

        if (!navLink) return null;

        // externe Links
        if (navLink._type === 'externalLink') {
          return (
            <a
              key={idx}
              href={navLink.url}
              target={item.openInNewTab ? '_blank' : '_self'}
              rel="noreferrer"
              className="header-menu-item"
              onClick={close}
            >
              <p>Test</p>
              {item.label}
            </a>
          );
        }

        // interne Links (z. B. pages, products)
        if (navLink._type === 'internalLink' && navLink.internalReference?.slug) {
          const url = `/${navLink.internalReference.slug}`;

          return (
            <NavLink
              key={idx}
              to={url}
              className="header-menu-item"
              prefetch="intent"
              style={activeLinkStyle}
              onClick={close}
            >
              <p>Test2</p>
              {item.label}
            </NavLink>
          );
        }

        return null;
      })}
    </nav>
  );
}



export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className="header-menu-item"
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <h3>☰</h3>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button className="reset" onClick={() => open('search')}>
      Search
    </button>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      Cart {count === null ? <span>&nbsp;</span> : count}
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}
