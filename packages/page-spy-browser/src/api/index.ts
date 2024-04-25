import { getRandomId } from 'base/src';
import { InitConfig } from 'page-spy-browser/types';

interface TResponse<T> {
  code: string;
  data: T;
  success: boolean;
  message: string;
}

interface TCreateRoom {
  name: string;
  address: string;
  password: string;
  group: string;
  tags: Record<string, any>;
}

const joinQuery = (args: Record<string, unknown>) => {
  const params = new URLSearchParams();
  Object.entries(args).forEach(([k, v]) => {
    params.append(k, String(v));
  });
  return params.toString();
};

export default class Request {
  constructor(public config: Required<InitConfig>) {
    /* c8 ignore next 3 */
    if (!config.api) {
      throw Error('The api base url cannot be empty');
    }
  }

  get base() {
    return this.config.api;
  }

  getScheme() {
    return this.config.enableSSL
      ? ['https://', 'wss://']
      : ['http://', 'ws://'];
  }

  createRoom() {
    const { project, title } = this.config;
    const scheme = this.getScheme();
    const query = joinQuery({
      name: navigator.userAgent,
      group: project,
      title,
    });
    return fetch(`${scheme[0]}${this.base}/api/v1/room/create?${query}`, {
      method: 'POST',
    })
      .then((res) => res.json())
      .then((res: TResponse<TCreateRoom>) => {
        const { name, address } = res.data || {};
        const roomUrl = this.getRoomUrl(address);
        return {
          roomUrl,
          address,
          name,
        };
      })
      .catch((err) => {
        /* c8 ignore next */
        throw Error(`Request create room failed: ${err.message}`);
      });
  }

  getRoomUrl(address: string) {
    const config = this.config;
    const scheme = this.getScheme();
    return `${scheme[1]}${this.base}/api/v1/ws/room/join?${joinQuery({
      address,
      'room.name': navigator.userAgent,
      'room.group': config.project,
      'room.title': config.title,
      name: `client:${getRandomId()}`,
      userId: 'Client',
      forceCreate: true,
    })}`;
  }
}
