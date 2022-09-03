// src/access.ts
export default function (initialState) {
  const user = initialState?.user;
  let isAdmin = user?.id == 0;
  if (user?.id != 0 && user?.permissions && user?.permissions?.includes('all')) {
    isAdmin = true;
  }
  // const isColl
  return {
    isCollaborator: user?.type && user?.type == 'collaborator',
    isAdmin,
  };
}
