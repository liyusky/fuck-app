const fs = require('fs')
const path = require('path')

const Params = require('./dependencies/config/params.js')
const defaultConfig = require('./dependencies/config/config.js')

const classes = fs.readdirSync('./src/class', 'utf8')
const components = fs.readdirSync('./src/module', 'utf8')

const FileType = ['vue', 'scss', 'js'];
const exDir = ['components', 'modal', 'module'];
const paths = {
  flex: './dependencies/sass/_flex.scss',
  unit: './dependencies/sass/_unit.scss',
  module: './src/module',
  class: './src/class'
}
const Template = {
  vue: fs.readFileSync('./dependencies/tempalte/tempalte.vue', 'utf8'),
  scss: fs.readFileSync('./dependencies/tempalte/tempalte.scss', 'utf8'),
  js: fs.readFileSync('./dependencies/tempalte/tempalte.js', 'utf8'),
  config: fs.readFileSync('./dependencies/tempalte/config.tempalte', 'utf8'),
  router: fs.readFileSync('./dependencies/tempalte/router.tempalte', 'utf8')
}

var config = { ...defaultConfig}, configTemplate = ''
var routers = {}

// tool fn
// 首字母大写
function firstChatUp(word) {
  return word.substring(0, 1).toUpperCase() + word.substring(1)
}

// 相对位置
function resolvePath (dir, name, type) {
  let types = {
    vue: 'vue',
    config: 'config.js',
    js: 'js',
    sass: 'scss'
  }
  return './' + path.join(dir, `${name}.${types[type]}`).replace('\\', '\/')
}

// 处理 config 模板
function formatConfig(router, vuexStr, classesStr, componentsStr, contentStr, template) {
  if (vuexStr) {
    vuexStr = vuexStr.substr(0, vuexStr.length - 1) + '\n\t'
  }
  else {
    vuexStr = '\n\t\tmutations: false,\n\t\tstate: false\n\t'
  }
  classesStr = classesStr.substr(0, classesStr.length - 1) + '\n\t'
  componentsStr = componentsStr.substr(0, componentsStr.length - 1) + '\n\t'
  template = Template.config
  if (!contentStr) contentStr = ''
  template = template.replace('SITE_CONTENT', contentStr)
  template = template.replace('SITE_ROUTER', router)
  template = template.replace('SITE_VUE', vuexStr)
  template = template.replace('SITE_CLASS', classesStr)
  template = template.replace('SITE_COMPONENTS', componentsStr)
  template = template.replace(/\t/g, '  ')
  return template
}

// 处理 vue 模板
function formatVue (template, name, result) {
  template = template.replace('SITE_CLASS_NAME', name + ' padding-top-126')
  template = template.replace('SITE_MODULE_NAME', setComponentsName(name))
  template = template.replace('SITE_PARAMS_NAME', result.params)
  template = template.replace('SITE_DEPENDENCE_NAME', result.dependence)
  template = template.replace(',SITE_COMPONENTS_NAME', result.components)
  template = template.replace('SITE_SASS_NAME', `./${name}.scss`)
  return template
}

// 处理 sass 模板
function formatSass (goal, name, refresh) {
  let template = `// include module\n`
  template += `@import '${path.relative(goal, paths.flex).replace(/\\/g, '/').replace('../', '')}';\n`
  template += `@import '${path.relative(goal, paths.unit).replace(/\\/g, '/').replace('../', '')}';\n`
  template += `// current sass`
  if (!refresh) template += `\n.${name} {}`
  return template
}

// 导入 组件
function formatComponents (dir, name, goal, refresh) {
  let dependence = '\n// include dependence\n'
  let components = ',\n\tcomponents: {'
  let params = '// start params'
  let start = '<!-- s  -->'
  let end = '<!-- e  -->'
  try {
    let config = require(resolvePath(dir, name, 'config'))
    for (let key in config) {
      switch (key) {
        case 'vuex':
          let vuexArr = []
          if (config.vuex.mutations) {
            vuexArr.push('mutations')
          }
          if (config.vuex.state) {
            vuexArr.push('state')
          }
          if (vuexArr.length > 0) {
            dependence += `import { ${vuexArr.join(', ')} } from 'vuex'\n`
          }
          break
        case 'class':
          for (let item in config.class) {
            if (config.class[item]) {
              dependence += `import ${item} from '${path.relative(goal, paths.class).replace(/\\/g, '/').replace('../', '')}/${item}.class.js'\n`
            }
          }
          break
        case 'components':
          for (let component in config.components) {
            if (config.components[component]) {
              dependence += `import ${setComponentsName(component)} from '${path.relative(goal, paths.module).replace(/\\/g, '/').replace('../', '')}/${component}/${component}.vue'\n`
              components += `\n\t\t${setComponentsName(component)},`
              if (!refresh) {
                params += `\n\t\t\t'${setParamsName(component)}': ${Params[component]},`
              }
              else if (typeof config.components[component] !== 'number') {
                params += `\n\t\t\t'${setParamsName(component)}': ${config.components[component]},`
              } 
            }
          }
          break
      }
    }
    dependence = dependence.substr(0, dependence.length - 1)
    if (refresh) dependence += `\nexport default {`
    if (components != ',\n\tcomponents: {') components = components.substr(0, components.length - 1)
    if (params != '// start params') params = params.substr(0, params.length - 1)
    params += `\n\t\t\t// end params`
    if (refresh) {
      start = `<!-- s ${config.content} -->`
      end = `<!-- e ${config.content} -->`
    }
  } catch (error) {
    console.log(error)
  }
  components += `\n\t\t// include components\n\t}`
  params = params.replace(/\t/g, '  ')
  dependence = dependence.replace(/\t/g, '  ')
  components = components.replace(/\t/g, '  ')
  return {
    dependence,
    components,
    params,
    start,
    end
  }
}

// 设置 组件名称
function setComponentsName (name) {
  let nameArr = name.split('-')
  nameArr.forEach((value, index) => {
    nameArr[index] = value.substring(0, 1).toUpperCase() + value.substring(1)
  })
  nameArr.push('Component')
  return nameArr.join('')
}

//设置变量名称
function setParamsName(name) {
  let nameArr = name.split('-')
  nameArr.forEach((value, index) => {
    if (index) {
      nameArr[index] = value.substring(0, 1).toUpperCase() + value.substring(1)
    }
  })
  return nameArr.join('')
}

// 创建 文件
function createFile (dir, content, refresh) {
  let result = fs.writeFileSync(dir, content)
  let refreshStr = '创建'
  if (refresh) refreshStr = '更新'
  let logStr = `${dir} ${refreshStr}成功`
  if (result) {
    logStr = `${dir} ${refreshStr}失败 ===== ${result}`
  }
}

// 循环
function loop (files, dir, callback, res) {
  files.forEach(item => {
    let currentDir = path.join(dir, item)
    let stats = fs.statSync(currentDir)
    if (stats.isDirectory()) {
      if (res) {
        console.log(currentDir)
        console.log(res)
      }
      return callback(currentDir, res)
    }
  })
}

// 加入 router
function buildRouter () {
  let pathsStr = ''
  let componentsStr = ''
  let children = ''
  
  Object.keys(routers).forEach(name => {
    componentsStr += `const ${setComponentsName(name)} = () => import(/* webpackChunkName: '${name}' */ '../${path.relative('./src', routers[name].dir).replace(/\\/g, '/')}/${name}.vue')\n`
    if (routers[name].children) {
      children = '['
      Object.keys(routers[name].children).forEach(child => {
        componentsStr += `const ${setComponentsName(child)} = () => import(/* webpackChunkName: '${child}' */ '../${path.relative('./src', routers[name].children[child].dir).replace(/\\/g, '/')}/${child}.vue')\n`
        children +=
        `
        {
          path: '/${child}',
          name: '${child}',
          component: ${setComponentsName(child)}
        },`
      })
      children = children.substr(0, children.length - 1)
      children += 
      `
      ]`
    }
    pathsStr += 
    `
    {
      path: '/${name}',
      name: '${name}',
      component: ${setComponentsName(name)}${children ? ',' : ''}`
    pathsStr += children ? 
      `
      children: ${children}` : ''
    pathsStr += 
    `
    },`
    children = ''
  })
  pathsStr = pathsStr.substr(0, pathsStr.length - 1) + '\n\t'
  componentsStr = componentsStr.substr(0, componentsStr.length - 1)
  let routerStr = Template.router
  routerStr = routerStr.replace('// include path', pathsStr)
  routerStr = routerStr.replace('// include components', componentsStr)
  routerStr = routerStr.replace(/\t/, '  ')
  createFile('./src/router/router.js', routerStr, true)
}

// 设置 完整的 config
function initConfig() {
  let componentsStr = '', classesStr = ''
  if (components.length) {
    components.forEach(item => {
      config.components[item] = false
      componentsStr += `\n\t\t'${item}': false,`
    })
  }
  if (classes.length) {
    classes.forEach(item => {
      config.class[firstChatUp(item.split('.')[0])] = false
      classesStr += `\n\t\t'${firstChatUp(item.split('.')[0])}': false,`
    });
  }
  configTemplate = formatConfig(false, false, classesStr, componentsStr, false, configTemplate)
}

// 更新 所有的 config 文件
function refreshConfig(dir, res) {
  let files = fs.readdirSync(dir, 'utf8')
  let name = path.basename(dir)
  let currentRes = routers[name]
  // 如果出错
  if (!(files instanceof Array)) {
    console.log(files)
    return
  }

  if (!exDir.includes(name)) {
    let file = `${name}.config.js`;
    let goal = path.join(dir, file)
    let currentTemplate = configTemplate
    let refresh = false

    if (files.includes(file)) {
      refresh = true
      let componentsStr = '', classesStr = '', vuexStr = '', contentStr = ''
      let configPath = './' + path.join(dir, `${name}.config.js`).replace('\\', '\/')
      let currentConfig = require(configPath)
      let newConfig = { ...config}
      Object.keys(newConfig).forEach(key => {
        let unit = newConfig[key]
        if (typeof unit !== 'object') {
          newConfig[key] = currentConfig[key]
        }
        else if (typeof unit === 'object') {
          Object.keys(unit).forEach(item => {
            if (key === 'components') {
              if (typeof currentConfig[key][item] === 'string') {
                unit[item] = '`' + currentConfig[key][item] + '`'
              }
              else if (typeof currentConfig[key][item] === 'number') {
                unit[item] = 1
              }
              else if (currentConfig[key][item]) {
                unit[item] = '`' + Params[item] + '`'
              }
              else {
                unit[item] = false
              }
            }
            else {
              unit[item] = currentConfig[key][item] || false
            }
          })
        }
      })
      if (newConfig.router) {
        let content = {
          dir: dir,
          children: false
        }
        if (res) {
          if (typeof res.children === 'boolean') {
            res.children = {
              [name]: content
            }
          }
          else {
            res.children[name] = content
          }
          currentRes = res.children[name]
        }
        else {
          routers[name] = content
        }
      }
      contentStr = newConfig.content
      for (let item in newConfig.vuex) vuexStr += `\n\t\t'${item}': ${newConfig.vuex[item]},`
      for (let item in newConfig.class) classesStr += `\n\t\t'${firstChatUp(item.split('.')[0])}': ${newConfig.class[item]},`
      for (let item in newConfig.components) componentsStr += `\n\t\t'${item}': ${newConfig.components[item]},`
      currentTemplate = formatConfig(newConfig.router, vuexStr, classesStr, componentsStr, contentStr, currentTemplate)
    }
    createFile(goal, currentTemplate, refresh)
  }
  return loop(files, dir, refreshConfig, routers[name])
}

// 创建 module 文件
function buildModule (dir, strict) {
  let files = fs.readdirSync(dir, 'utf8')
  let name = path.basename(dir)
  
  if (!exDir.includes(name)) {
    FileType.forEach(type => {
      let file = name + '.' + type;
      let goal = path.join(dir, file)
      let content = Template[type]
      if (!files.includes(file)) {
        switch (type) {
          case 'scss':
            content = formatSass(goal, name)
            break
          case 'vue':
            content = formatVue(content, name, {
              dependence: '',
              components: '',
              params: ''
            })
            break
        }
        createFile(goal, content)
      }
    });
  }
  return loop(files, dir, buildModule)
}

function buildComponents (dir) {
  let files = fs.readdirSync(dir, 'utf8')
  let name = path.basename(dir)

  if (!exDir.includes(name)) {
    if (!files.includes(`${name}.config.js`)) {
      console.log(`${dir} 下不存在 ${name}.config.js`)
    }
    else {
      FileType.forEach(type => {
        let file = name + '.' + type;
        let goal = path.join(dir, file)
        let content = Template[type]
        if (!files.includes(file)) {
          switch (type) {
            case 'scss':
              content = formatSass(goal, name)
              break
            case 'vue':
              let result = formatComponents(dir, name, goal, false)
              content = formatVue(content, name, result)
              break
          }
          createFile(goal, content)
        }
        else if (type == 'vue') {
          content = fs.readFileSync(resolvePath(dir, name, 'vue'), 'utf8')
          let result = formatComponents(dir, name, goal, true)
          content = content.replace(/<!-- s [^\t\v\n\r\f]* -->/, result.start)
          content = content.replace(/<!-- e [^\t\v\n\r\f]* -->/, result.end)
          content = content.replace(/\/\/ start params[^]*\/\/ end params/, result.params)
          content = content.replace(/\n\/\/ include dependence[^]*export default {/, result.dependence)
          content = content.replace(/,\n  components: {[^]*\/\/ include components\n  }/, result.components)
          createFile(goal, content, true)
        } else if (type == 'scss') {
          content = fs.readFileSync(resolvePath(dir, name, 'sass'), 'utf8')
          let result = formatSass(goal, name, true)
          content = content.replace(/\/\/ include module[^]*\/\/ current sass/, result)
          createFile(goal, content, true)
        }
      })
    }
  }
  return loop(files, dir, buildComponents)
}

initConfig()
refreshConfig('./src/components')
buildRouter()
buildModule('./src/module')
buildComponents('./src/components')
