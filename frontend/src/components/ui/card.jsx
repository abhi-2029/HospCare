import React from "react";
import PropTypes from "prop-types";

export function Card({ className = "", ...props }) {
  return (
    <div
      className={`rounded-xl border bg-white shadow-sm p-4 ${className}`}
      {...props}
    />
  );
}

export function CardContent({ className = "", ...props }) {
  return (
    <div className={`mt-4 ${className}`} {...props} />
  );
}

Card.propTypes = {
  className: PropTypes.string,
};

CardContent.propTypes = {
  className: PropTypes.string,
};
