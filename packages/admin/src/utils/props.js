/**
 * Separates the key prop from other props
 * Use this helper to avoid React warning about spreading key prop
 * 
 * @param {Object} props - Props object that may contain a key
 * @returns {Object} Object with separated key and remaining props
 */
export const separateKeyFromProps = (props) => {
  if (!props) return { key: undefined, restProps: {} };
  
  const { key, ...restProps } = props;
  return { key, restProps };
};

/**
 * Helper to safely apply props to components by excluding the key prop
 * from the spread
 * 
 * @param {Object} props - Props object that may contain a key
 * @returns {Object} Props object without the key property
 */
export const withoutKey = (props) => {
  if (!props) return {};
  
  const { key, ...rest } = props;
  return rest;
}; 