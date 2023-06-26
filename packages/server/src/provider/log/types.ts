export interface loginLog {
  time: string;
}
export enum EventType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  RUN_PIPELINE = 'runPipeline',
  SYSTEM = 'system',
}
