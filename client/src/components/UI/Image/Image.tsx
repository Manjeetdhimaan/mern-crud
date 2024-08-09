import React, { useState } from 'react';

import { ImageWithFallbackProps } from '../../../models/ui.model';

const Image: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  defaultSrc,
  className,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src);

  const handleError = () => {
    setImgSrc(defaultSrc);
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
};

export default Image;