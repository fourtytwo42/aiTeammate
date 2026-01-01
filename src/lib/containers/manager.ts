import { docker } from './docker';

export async function startContainer(containerId: string) {
  const container = docker.getContainer(containerId);
  await container.start();
}

export async function stopContainer(containerId: string) {
  const container = docker.getContainer(containerId);
  await container.stop();
}
