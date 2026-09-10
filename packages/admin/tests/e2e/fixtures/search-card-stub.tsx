import { forwardRef, useImperativeHandle } from 'react';

/** Fixture stand-in so NavBar can bundle without SearchCard / search API. */
const SearchCard = forwardRef(function SearchCard(_props, ref) {
  useImperativeHandle(ref, () => ({
    openFromUserGesture() {
      return true;
    },
  }));
  return null;
});

export default SearchCard;
