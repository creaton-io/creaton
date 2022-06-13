const size = {
    xs: "320px",
    sm: "768px",
    lg: "1200px",
  };
  
  const device = {
    xs: `(min-width: ${size.xs})`,
    sm: `(min-width: ${size.sm})`,
    lg: `(min-width: ${size.lg})`,
  };
  
  const breakpoint = { size, device };
  
  export default breakpoint;