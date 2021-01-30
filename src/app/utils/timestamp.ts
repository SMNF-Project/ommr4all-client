
export function timestampNow(): string {
  const date = new Date();
  const timestamp = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate()
    + '_' + date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds();
  return timestamp;
}
