export const convertUTCToLocal = (dateString) => {
  const date = new Date(dateString);
  const localTime = new Date(date.getTime() + (7 * 60 * 60 * 1000)); // UTC+7
  return localTime.toISOString().slice(0, 16).replace('T', ' ');
};

export const formatProjectDates = (projects) => {
  return projects.map(project => {
    return {
      ...project,
      lastUpdate: convertUTCToLocal(project.lastUpdate)
    };
  });
};

export const formatProcessDates = (processes) => {
  return processes.map(process => {
    return {
      ...process,
      lastUpdate: convertUTCToLocal(process.lastUpdate),
      children: formatProcessDates(process.children || [])
    };
  });
};
