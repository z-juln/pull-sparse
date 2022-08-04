# pull-sparse

从git/npm远程仓库中，指定要拉取的目录，而不是整个项目拉取

## usage

```typescript
import { gitPull, npmPull } from 'pull-sparse';

gitPull('you repository url', {
  outputDir: path.resolve('.'), // 默认为'.'
  targetDir: 'packages/project-a', // 默认为''
  renameTargetDir: '', // 默认不修改目录名
  // withDotGit: true, // 默认为false，即不附带.git目录
  branch: 'v1.0.0', // 默认为master
});

npmPull('you package name', {
  registryUrl: 'https://registry.npmjs.org/', // 默认为'https://registry.npmjs.org/'
  outputDir: '/Volumes/dev/demo-demo-demo', // 默认为'.'
  targetDir: 'src/utils', // 默认为''
  renameTargetDir: 'my-utils', // 默认不修改目录名
  tag: 'latest', // 默认为latest
});
```
