import { memo } from 'react';
import Typography from './Typography';

const Footer = memo(function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer role="contentinfo" className="mt-auto border-t border-gray-200 bg-gray-50 px-6 py-6">
      <Typography variant="caption" color="secondary" align="center" className="text-gray-600">
        © {currentYear} SW Couriers. All rights reserved.
      </Typography>
    </footer>
  );
});

export default Footer;
