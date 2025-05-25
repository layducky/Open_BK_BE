function filterNull(obj) {
   return Object.fromEntries(
     Object.entries(obj).filter(([_, value]) => value !== null)
   );
}

function checkNull(obj) {
   return Object.values(obj).some(value => value === null);
}

module.exports = {filterNull, checkNull}