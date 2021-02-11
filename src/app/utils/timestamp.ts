
export function timestampNow(): string {
  const date = new Date();
  // const timestamp = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate()
  //   + '_' + date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds();
  const timestamp = date.toISOString().substr(0, 19);
  return timestamp;
}
