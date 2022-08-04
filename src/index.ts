import fs from 'fs-extra';
import { execSync, spawn } from 'child_process';
import path from 'path';
// @ts-ignore
import mvdir from 'mvdir';
import os from 'os';

const getTmpDir = () => {
  const tempDir = path.resolve(os.tmpdir(), `git-clone-sparse--${Date.now()}`);
  fs.ensureDirSync(tempDir);
  return tempDir;
};

export interface GitOpts {
  targetDir?: string;
  renameTargetDir?: string;
  outputDir?: string;
  branch?: string;
  withDotGit?: boolean;
}

export const gitPull = async (repository: string, opts?: GitOpts) => {
  let {
    targetDir,
    renameTargetDir = targetDir,
    outputDir,
    withDotGit,
    branch,
  } = Object.assign({
    targetDir: '',
    outputDir: '.',
    withDotGit: false,
    branch: 'master',
  }, opts) as Required<GitOpts>;
  outputDir = path.resolve(outputDir);

  fs.ensureDirSync(outputDir);
  fs.emptyDirSync(outputDir);

  const tempDir = getTmpDir();
  const mv = (source: string, dest: string) => mvdir(path.resolve(tempDir, source), path.resolve(outputDir, dest));

  gitSimpleSparsePull(repository, { outputDir: tempDir, targetDir, branch });
  await mv(targetDir, renameTargetDir);
  if (withDotGit) {
    await mv('.git', '.git');
  }
};

export interface NpmOpts {
  registryUrl?: string;
  targetDir?: string;
  renameTargetDir?: string;
  outputDir?: string;
  tag?: string;
}

export const npmPull = async (pkgName: string, opts?: NpmOpts) => {
  let {
    registryUrl,
    targetDir,
    renameTargetDir = targetDir,
    outputDir,
    tag,
  } = Object.assign({
    registryUrl: 'https://registry.npmjs.org/',
    targetDir: '',
    outputDir: '.',
    tag: 'latest',
  }, opts) as Required<NpmOpts>;
  outputDir = path.resolve(outputDir);

  fs.ensureDirSync(outputDir);
  fs.emptyDirSync(outputDir);

  const tempDir = getTmpDir();
  const mv = (source: string, dest: string) => mvdir(path.resolve(tempDir, source), path.resolve(outputDir, dest));

  await npmInstall(pkgName, { outputDir: tempDir, registryUrl, tag });
  await mv(path.join('node_modules', pkgName, targetDir), renameTargetDir);
};

/** 只做sparse拉取，不加工 */
const gitSimpleSparsePull = (repository: string, {
  outputDir,
  targetDir,
  branch,
}: {
  outputDir: string;
  targetDir: string;
  branch: string;
}) => {
  const dotGitPath = path.resolve(outputDir, '.git');
  if (!fs.existsSync(dotGitPath)) {
    execSync('git init', { cwd: outputDir });
  }
  execSync(
    `
      git init
      &&
      git remote add -f origin ${repository}
      &&
      git config core.sparsecheckout true
      &&
      echo ${targetDir} >> .git/info/sparse-checkout
      &&
      git pull origin ${branch}
    `.replace(/\n/igm, ''),
    { cwd: outputDir }
  );
};

const npmInstall = (pkgName: string, {
  outputDir,
  registryUrl,
  tag,
}: {
  outputDir: string;
  registryUrl: string;
  tag: string;
}) => new Promise<void>((resolve, reject) => {
  spawn(
    'npm', ['i', `${pkgName}@${tag}`, `--registry=${registryUrl}`],
    { cwd: outputDir, stdio: 'inherit' },
  )
    .on('close', resolve)
    .on('error', reject);
});

// gitPull('git@gitlab.hupu.com:foundation-frontend/hupu-fed-ejs-tpls.git', {
//   outputDir: '/Volumes/dev/demo-demo-web',
//   targetDir: 'src/project/ssr',
//   renameTargetDir: '',
//   withDotGit: false,
//   branch: 'master',
// });

// npmPull('np-guard', {
//   registryUrl: 'https://registry.npmjs.org/',
//   outputDir: '/Volumes/dev/demo-demo-demo',
//   targetDir: 'src/utils',
//   renameTargetDir: 'my-utils',
//   tag: 'latest',
// });
