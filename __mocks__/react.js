// Right now is not a way to trigger useEffect from Jest
// see: https://github.com/facebook/react/issues/14050
// TODO: Remove this module mock when solved
import * as React from 'react';
module.exports = { ...React, useEffect: React.useLayoutEffect };
