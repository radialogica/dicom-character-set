import _ from 'lodash';

// Merge two objects
// Instead of merging array objects index by index (n-th source
// item with n-th object item) it concatenates both arrays
export default function(object, source) {
  const clone = _.cloneDeep(object);
  const merged = _.mergeWith(clone, source, function(objValue, srcValue, key, object, source, stack) {
    if(objValue && srcValue && _.isArray(objValue) && _.isArray(srcValue)) {
      return _.concat(objValue, srcValue);
    }
  });

  return merged;
}