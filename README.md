#### 这是一个非常棒的前端整体架构方案，由[paulirish](http://paulirish.com/)发起,多位国外优秀的前端工程师构建
#### 这是一个分支，原项目地址：[https://github.com/paulirish/html5-boilerplate](https://github.com/paulirish/html5-boilerplate)

[点击这里可以查看项目历史更改](http://github.com/paulirish/html5-boilerplate/compare/v0.9...v0.9.1)

## 感谢:

voodootikigod, garowetz, fearphage, christopherjacob, mathias bynens, daniel harttman, rse, chris dary, erik dahlstrom, timwillison, kenneth nordahl, riddle, elcuervo, andreas kuckartz, 3rdEden, riley willis, majic3


## License:

包含的主要组件如下:

* Modernizr: MIT/BSD license
* jQuery: MIT/GPL license
* DD_belatedPNG: MIT license
* YUI Profiling: BSD license
* HTML5Doctor CSS reset: Public Domain
* CSS Reset Reloaded: Public Domain

Everything else:

* [The Unlicense](http://unlicense.org) (aka: public domain) 


## 摘要:

这是一个现成网站前端架构，前端开发者可以使用这里的文件搭建一个网站，以下是它包括的功能：


1. 跨浏览器兼容,当然也包括IE6
2. 为HTML5做的准备，使用HTML5新标签。
3. 顶级性能的缓存优化和压缩规则(build工具集和.htaccess,对于服务器有足够权限的可以使用它们)
4. 最佳实践的网站配置
5. Think there's too much? The HTML5 Boilerplate is delete-key friendly. :)（后面一句怎么翻译？囧！）
6. 移动设备浏览器优化
7. 渐进增强和平稳退化
8. 最有效的不同IE浏览器的Css Class控制,很好的处理各个版本的CSS Hack问题
9. 想写单元测试又懒惰，一个完整的测试套件为你准备好了。
10. IE6 IE7的JS代码分析
11. 集成了一个轻量级的console.log，不用担心发布后产生错误。
12. 绝对没有问题的doctype标记
13. 最佳的打印样式，性能也作了优化
14. 适合IOS，Android和Opera移动端CSS的框架。
15. IE6 pngfix baked in.
16. jQuery等着你来使用

## 文件目录结构说明 	（目录结构并不代表项目中应该完全遵照，名称可根据需要更改）
* build/			包含一组前端打包和发布的工具（产品不一定用得上）
* css/				css文件目录
* demo/				demo
* img/				图片文件目录
* js/	  			js文件目录
* --libs/			js通用库，如jquery,modernizr
* ----jquery-ui/	jqueryUI库目录
* --pwlibs			自己根据项目中的业务写的libs，如form检测、各种业务组件
* test/				单元测试（考虑要不要写JS单元测试？）
* .htaccess			站点的apache服务器配置（需要有足够的服务器权限，一般不会怎么用）
* 404.html			404文件，这个与前端关系不大，取决于网站整体架构
* README.md			项目说明，github需要
* crossdomain.xml	flash里使用到跨域功能配置
* favicon.ico		网站图标
* humans.txt		不理解为什么要这个，google网站有这个文件
* index.html		页页HTML结构参照文件
* robots.txt 		站点蜘蛛访问配置文件


