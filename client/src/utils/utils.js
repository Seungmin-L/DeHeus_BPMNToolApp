export const convertUTCToLocal = (dateString) => {
  const date = new Date(dateString);
  if (!dateString) {
    return 'N/A';
}

  const localTime = new Date(date.getTime() + (7 * 60 * 60 * 1000)); // UTC+7
  return localTime.toISOString().slice(0, 16).replace('T', ' ');
};

export const formatProjectDates = (projects) => {
  return projects.map(project => {
    return {
      ...project,
      last_update: convertUTCToLocal(project.last_update)
    };
  });
};

export const formatProcessDates = (processes) => {
  return processes.map(process => {
    return {
      ...process,
      lastUpdate: convertUTCToLocal(process.last_update),
      children: formatProcessDates(process.child_diagram || [])
    };
  });
};
