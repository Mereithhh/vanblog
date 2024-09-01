export class CreatePipelineDto {
  name: string;
  description?: string;
  enabled: boolean;
  eventName: string;
  script: string;
  deps?: string[];
}

export class UpdatePipelineDto {
  name?: string;
  description?: string;
  enabled?: boolean;
  eventName?: string;
  script?: string;
  deps?: string[];
}
