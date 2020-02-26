# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.1.0-alpha.10](https://github.com/prosoft-edv/components/compare/@prosoft/components@0.1.0-alpha.9...@prosoft/components@0.1.0-alpha.10) (2020-02-26)


### Performance Improvements

* **table:** less layout trashing on data update ([#72](https://github.com/prosoft-edv/components/issues/72)) ([b5ebfe9](https://github.com/prosoft-edv/components/commit/b5ebfe9))





# [0.1.0-alpha.9](https://github.com/prosoft-edv/components/compare/@prosoft/components@0.1.0-alpha.8...@prosoft/components@0.1.0-alpha.9) (2020-02-18)


### Bug Fixes

* **select:** values set before AfterViewInit are now working correctly ([#71](https://github.com/prosoft-edv/components/issues/71)) ([bf14362](https://github.com/prosoft-edv/components/commit/bf14362))





# [0.1.0-alpha.8](https://github.com/prosoft-edv/components/compare/@prosoft/components@0.1.0-alpha.7...@prosoft/components@0.1.0-alpha.8) (2020-02-17)


### Bug Fixes

* **form-field:** help button has now type button ([5eaf5a1](https://github.com/prosoft-edv/components/commit/5eaf5a1))





# [0.1.0-alpha.7](https://github.com/prosoft-edv/components/compare/@prosoft/components@0.1.0-alpha.6...@prosoft/components@0.1.0-alpha.7) (2020-02-17)


### Features

* **form:** added dataSource input ([#70](https://github.com/prosoft-edv/components/issues/70)) ([c49f93f](https://github.com/prosoft-edv/components/commit/c49f93f))
* **form-field:** subscriptType and hintToggle inputs ([#69](https://github.com/prosoft-edv/components/issues/69)) ([10ee428](https://github.com/prosoft-edv/components/commit/10ee428))


### BREAKING CHANGES

* **form-field:** Hint toggle button is now off by default and form-field resizes for multiline
hint/error by default





# [0.1.0-alpha.6](https://github.com/prosoft-edv/components/compare/@prosoft/components@0.1.0-alpha.4...@prosoft/components@0.1.0-alpha.6) (2020-01-30)


### Bug Fixes

* **savebar:** ctrl+s wonn't trigger save if saveing is disabled ([#64](https://github.com/prosoft-edv/components/issues/64)) ([79a321b](https://github.com/prosoft-edv/components/commit/79a321b))
* **select:** form-field container click now opens select ([#58](https://github.com/prosoft-edv/components/issues/58)) ([ac1498d](https://github.com/prosoft-edv/components/commit/ac1498d))
* **table:** cardLayout and pagination styling ([#68](https://github.com/prosoft-edv/components/issues/68)) ([a3cad50](https://github.com/prosoft-edv/components/commit/a3cad50)), closes [#60](https://github.com/prosoft-edv/components/issues/60)
* **table:** fixed layout of table-header items ([#48](https://github.com/prosoft-edv/components/issues/48)) ([9bbb805](https://github.com/prosoft-edv/components/commit/9bbb805))
* **table:** refreshable input is now working again ([#67](https://github.com/prosoft-edv/components/issues/67)) ([dc1f283](https://github.com/prosoft-edv/components/commit/dc1f283)), closes [#62](https://github.com/prosoft-edv/components/issues/62)


### Features

* **form-field:** hint/error are shown in an expandable bubble ([#66](https://github.com/prosoft-edv/components/issues/66)) ([899d42b](https://github.com/prosoft-edv/components/commit/899d42b))
* **table:** current table state can be controlled with a state manager ([#65](https://github.com/prosoft-edv/components/issues/65)) ([ab507eb](https://github.com/prosoft-edv/components/commit/ab507eb))
* **table:** Implemented an option to use a custom row detail toggle ([#51](https://github.com/prosoft-edv/components/issues/51)) ([00ed0e5](https://github.com/prosoft-edv/components/commit/00ed0e5)), closes [#49](https://github.com/prosoft-edv/components/issues/49)





# 0.1.0-alpha.5 (2019-11-04)


### Bug Fixes

* **block-ui:** spinner is not vertically centered ([#5](https://github.com/prosoft-edv/components/issues/5)) ([517705b](https://github.com/prosoft-edv/components/commit/517705b))
* **block-ui:** spinner position is now in the middle in more cases ([#21](https://github.com/prosoft-edv/components/issues/21)) ([80eba09](https://github.com/prosoft-edv/components/commit/80eba09))
* **form:** error view icon has primary color instead of error color ([#7](https://github.com/prosoft-edv/components/issues/7)) ([a49c731](https://github.com/prosoft-edv/components/commit/a49c731))
* **form:** sometimes the savebar buttons arent visible after loading ([#12](https://github.com/prosoft-edv/components/issues/12)) ([9d759a9](https://github.com/prosoft-edv/components/commit/9d759a9))
* **form:** when loading instantly failed, then cancel label wasn't shown ([#8](https://github.com/prosoft-edv/components/issues/8)) ([b931c6c](https://github.com/prosoft-edv/components/commit/b931c6c))
* **form-field:** async checkbox labels in the template are overwritten ([#9](https://github.com/prosoft-edv/components/issues/9)) ([37e03a9](https://github.com/prosoft-edv/components/commit/37e03a9))
* **form-field:** when getLabel runs async then the label is not shown ([#10](https://github.com/prosoft-edv/components/issues/10)) ([0750975](https://github.com/prosoft-edv/components/commit/0750975))
* **select:** fixed ngModel bindings ([2219e35](https://github.com/prosoft-edv/components/commit/2219e35))
* **select:** valueChanges triggers twice when selecting an option ([e78da66](https://github.com/prosoft-edv/components/commit/e78da66))
* **slider:** nouislider css is now bundled with the component ([#26](https://github.com/prosoft-edv/components/issues/26)) ([4da289a](https://github.com/prosoft-edv/components/commit/4da289a))
* **table:** fixed layout of table-header items ([#48](https://github.com/prosoft-edv/components/issues/48)) ([9bbb805](https://github.com/prosoft-edv/components/commit/9bbb805))
* **table:** sort ascending button style fix ([29cd546](https://github.com/prosoft-edv/components/commit/29cd546))
* renamed interface name ([401da66](https://github.com/prosoft-edv/components/commit/401da66))


### Code Refactoring

* simplified registering of the modules ([#20](https://github.com/prosoft-edv/components/issues/20)) ([34bd959](https://github.com/prosoft-edv/components/commit/34bd959))


### Features

* **block-ui:** loading overlay component ([#3](https://github.com/prosoft-edv/components/issues/3)) ([058974f](https://github.com/prosoft-edv/components/commit/058974f))
* **flip-container:** remove dom nodes of the hidden side ([#23](https://github.com/prosoft-edv/components/issues/23)) ([74ca4d5](https://github.com/prosoft-edv/components/commit/74ca4d5))
* **form:** added blocked input ([#19](https://github.com/prosoft-edv/components/issues/19)) ([1710ed2](https://github.com/prosoft-edv/components/commit/1710ed2))
* **form:** form component ([#4](https://github.com/prosoft-edv/components/issues/4)) ([d898086](https://github.com/prosoft-edv/components/commit/d898086))
* **form:** form input is now optional ([#14](https://github.com/prosoft-edv/components/issues/14)) ([fb77c84](https://github.com/prosoft-edv/components/commit/fb77c84))
* **form-errors:** customizable filter for errors ([#45](https://github.com/prosoft-edv/components/issues/45)) ([ca6addc](https://github.com/prosoft-edv/components/commit/ca6addc))
* **form-errors:** form-errors component ([2d6013d](https://github.com/prosoft-edv/components/commit/2d6013d))
* **form-errors:** inculdeControls customizable ([#44](https://github.com/prosoft-edv/components/issues/44)) ([4f245f2](https://github.com/prosoft-edv/components/commit/4f245f2))
* **form-field:** mat-form-field wrapper for better control compat ([7169fa8](https://github.com/prosoft-edv/components/commit/7169fa8))
* **form-field:** recognize the [appearence] property of mat-form-field ([#38](https://github.com/prosoft-edv/components/issues/38)) ([cf83c4f](https://github.com/prosoft-edv/components/commit/cf83c4f)), closes [#37](https://github.com/prosoft-edv/components/issues/37)
* **savebar:** implemented hide mode and made change detector public ([#6](https://github.com/prosoft-edv/components/issues/6)) ([e2bfd67](https://github.com/prosoft-edv/components/commit/e2bfd67))
* **savebar:** shows form errors and save/cancel buttons ([#2](https://github.com/prosoft-edv/components/issues/2)) ([3af87be](https://github.com/prosoft-edv/components/commit/3af87be))
* **select:** added support for errorStateMatcher input ([f1e53c6](https://github.com/prosoft-edv/components/commit/f1e53c6))
* **select:** css classes to style the search, empty input or options ([#11](https://github.com/prosoft-edv/components/issues/11)) ([56d792b](https://github.com/prosoft-edv/components/commit/56d792b))
* **select:** custom options templates ([11b0b76](https://github.com/prosoft-edv/components/commit/11b0b76))
* **select:** custom trigger template ([#13](https://github.com/prosoft-edv/components/issues/13)) ([b920094](https://github.com/prosoft-edv/components/commit/b920094))
* **select:** ps-select dataSource can now be an options object ([6b0d2a7](https://github.com/prosoft-edv/components/commit/6b0d2a7))
* **select:** refactoring to allow custom sort for default data source ([#16](https://github.com/prosoft-edv/components/issues/16)) ([338269e](https://github.com/prosoft-edv/components/commit/338269e))
* **slider:** slider component ([#18](https://github.com/prosoft-edv/components/issues/18)) ([772b3de](https://github.com/prosoft-edv/components/commit/772b3de))
* **table:** Added a debounce to pagination ([#32](https://github.com/prosoft-edv/components/issues/32)) ([778d9d5](https://github.com/prosoft-edv/components/commit/778d9d5))
* **table:** Implemented an option to use a custom row detail toggle ([#51](https://github.com/prosoft-edv/components/issues/51)) ([00ed0e5](https://github.com/prosoft-edv/components/commit/00ed0e5)), closes [#49](https://github.com/prosoft-edv/components/issues/49)
* **table:** settings of ps-table can be customized ([#28](https://github.com/prosoft-edv/components/issues/28)) ([c758131](https://github.com/prosoft-edv/components/commit/c758131))
* **table:** table component ([#22](https://github.com/prosoft-edv/components/issues/22)) ([0f01782](https://github.com/prosoft-edv/components/commit/0f01782))
* changed OptionsPsSelectService to allow array/observable ([14ff342](https://github.com/prosoft-edv/components/commit/14ff342))
* flip-container component ([3825ef7](https://github.com/prosoft-edv/components/commit/3825ef7))
* ps-select component ([9bd4521](https://github.com/prosoft-edv/components/commit/9bd4521))


### Performance Improvements

* **select:** reduced amount of change detection runs ([9936940](https://github.com/prosoft-edv/components/commit/9936940))
* **table:** removed unnecessary Dom-Nodes from Option-Buttons ([#27](https://github.com/prosoft-edv/components/issues/27)) ([30e0880](https://github.com/prosoft-edv/components/commit/30e0880))


### BREAKING CHANGES

* PsExceptionMessageExtractor was moved to @prosoft/components/core 
and the forRoot() methods of PsFormModule and PsSavebarModule were removed.
* **select:** class/interface renames:
PsSelectOptionsData -> PsSelectDataSourceOptions
OptionsPsSelectService -> DefaultPsSelectService
DynamicPsSelectDataSource -> DefaultPsSelectDataSource
constructor for DefaultPsSelectDataSource changed






# [0.1.0-alpha.4](https://github.com/prosoft-edv/components/compare/@prosoft/components@0.1.0-alpha.3...@prosoft/components@0.1.0-alpha.4) (2019-10-30)

**Note:** Version bump only for package @prosoft/components





# [0.1.0-alpha.3](https://github.com/prosoft-edv/components/compare/@prosoft/components@0.1.0-alpha.2...@prosoft/components@0.1.0-alpha.3) (2019-10-23)


### Features

* **form-errors:** customizable filter for errors ([#45](https://github.com/prosoft-edv/components/issues/45)) ([ca6addc](https://github.com/prosoft-edv/components/commit/ca6addc))





# [0.1.0-alpha.2](https://github.com/prosoft-edv/components/compare/@prosoft/components@0.1.0-alpha.1...@prosoft/components@0.1.0-alpha.2) (2019-10-23)


### Features

* **form-errors:** inculdeControls customizable ([#44](https://github.com/prosoft-edv/components/issues/44)) ([4f245f2](https://github.com/prosoft-edv/components/commit/4f245f2))





# [0.1.0-alpha.1](https://github.com/prosoft-edv/components/compare/@prosoft/components@0.1.0-alpha.0...@prosoft/components@0.1.0-alpha.1) (2019-10-16)


### Features

* **form-field:** recognize the [appearence] property of mat-form-field ([#38](https://github.com/prosoft-edv/components/issues/38)) ([cf83c4f](https://github.com/prosoft-edv/components/commit/cf83c4f)), closes [#37](https://github.com/prosoft-edv/components/issues/37)





# [0.1.0-alpha.0](https://github.com/prosoft-edv/components/compare/@prosoft/components@0.0.2-alpha.8...@prosoft/components@0.1.0-alpha.0) (2019-10-11)


### Bug Fixes

* **slider:** nouislider css is now bundled with the component ([#26](https://github.com/prosoft-edv/components/issues/26)) ([4da289a](https://github.com/prosoft-edv/components/commit/4da289a))
* **table:** sort ascending button style fix ([29cd546](https://github.com/prosoft-edv/components/commit/29cd546))


### Features

* **table:** Added a debounce to pagination ([#32](https://github.com/prosoft-edv/components/issues/32)) ([778d9d5](https://github.com/prosoft-edv/components/commit/778d9d5))
* **table:** settings of ps-table can be customized ([#28](https://github.com/prosoft-edv/components/issues/28)) ([c758131](https://github.com/prosoft-edv/components/commit/c758131))


### Performance Improvements

* **table:** removed unnecessary Dom-Nodes from Option-Buttons ([#27](https://github.com/prosoft-edv/components/issues/27)) ([30e0880](https://github.com/prosoft-edv/components/commit/30e0880))





## [0.0.2-alpha.8](https://github.com/prosoft-edv/components/compare/@prosoft/components@0.0.2-alpha.7...@prosoft/components@0.0.2-alpha.8) (2019-09-03)


### Bug Fixes

* **block-ui:** spinner position is now in the middle in more cases ([#21](https://github.com/prosoft-edv/components/issues/21)) ([80eba09](https://github.com/prosoft-edv/components/commit/80eba09))


### Code Refactoring

* simplified registering of the modules ([#20](https://github.com/prosoft-edv/components/issues/20)) ([34bd959](https://github.com/prosoft-edv/components/commit/34bd959))


### Features

* **flip-container:** remove dom nodes of the hidden side ([#23](https://github.com/prosoft-edv/components/issues/23)) ([74ca4d5](https://github.com/prosoft-edv/components/commit/74ca4d5))
* **slider:** slider component ([#18](https://github.com/prosoft-edv/components/issues/18)) ([772b3de](https://github.com/prosoft-edv/components/commit/772b3de))
* **table:** table component ([#22](https://github.com/prosoft-edv/components/issues/22)) ([0f01782](https://github.com/prosoft-edv/components/commit/0f01782))


### BREAKING CHANGES

* PsExceptionMessageExtractor was moved to @prosoft/components/core 
and the forRoot() methods of PsFormModule and PsSavebarModule were removed.





## [0.0.2-alpha.7](https://github.com/prosoft-edv/components/compare/@prosoft/components@0.0.2-alpha.6...@prosoft/components@0.0.2-alpha.7) (2019-08-20)


### Features

* **form:** added blocked input ([#19](https://github.com/prosoft-edv/components/issues/19)) ([1710ed2](https://github.com/prosoft-edv/components/commit/1710ed2))





## [0.0.2-alpha.6](https://github.com/prosoft-edv/components/compare/@prosoft/components@0.0.2-alpha.5...@prosoft/components@0.0.2-alpha.6) (2019-08-09)


### Features

* **select:** refactoring to allow custom sort for default data source ([#16](https://github.com/prosoft-edv/components/issues/16)) ([338269e](https://github.com/prosoft-edv/components/commit/338269e))


### BREAKING CHANGES

* **select:** class/interface renames:
PsSelectOptionsData -> PsSelectDataSourceOptions
OptionsPsSelectService -> DefaultPsSelectService
DynamicPsSelectDataSource -> DefaultPsSelectDataSource
constructor for DefaultPsSelectDataSource changed





## [0.0.2-alpha.5](https://github.com/prosoft-edv/components/compare/@prosoft/components@0.0.2-alpha.4...@prosoft/components@0.0.2-alpha.5) (2019-08-07)


### Bug Fixes

* **form:** sometimes the savebar buttons arent visible after loading ([#12](https://github.com/prosoft-edv/components/issues/12)) ([9d759a9](https://github.com/prosoft-edv/components/commit/9d759a9))


### Features

* **form:** form input is now optional ([#14](https://github.com/prosoft-edv/components/issues/14)) ([fb77c84](https://github.com/prosoft-edv/components/commit/fb77c84))
* **select:** css classes to style the search, empty input or options ([#11](https://github.com/prosoft-edv/components/issues/11)) ([56d792b](https://github.com/prosoft-edv/components/commit/56d792b))
* **select:** custom trigger template ([#13](https://github.com/prosoft-edv/components/issues/13)) ([b920094](https://github.com/prosoft-edv/components/commit/b920094))





## [0.0.2-alpha.4](https://github.com/prosoft-edv/components/compare/@prosoft/components@0.0.2-alpha.3...@prosoft/components@0.0.2-alpha.4) (2019-08-06)


### Bug Fixes

* **form:** error view icon has primary color instead of error color ([#7](https://github.com/prosoft-edv/components/issues/7)) ([a49c731](https://github.com/prosoft-edv/components/commit/a49c731))
* **form:** when loading instantly failed, then cancel label wasn't shown ([#8](https://github.com/prosoft-edv/components/issues/8)) ([b931c6c](https://github.com/prosoft-edv/components/commit/b931c6c))
* **form-field:** async checkbox labels in the template are overwritten ([#9](https://github.com/prosoft-edv/components/issues/9)) ([37e03a9](https://github.com/prosoft-edv/components/commit/37e03a9))
* **form-field:** when getLabel runs async then the label is not shown ([#10](https://github.com/prosoft-edv/components/issues/10)) ([0750975](https://github.com/prosoft-edv/components/commit/0750975))





## [0.0.2-alpha.3](https://github.com/prosoft-edv/components/compare/@prosoft/components@0.0.2-alpha.2...@prosoft/components@0.0.2-alpha.3) (2019-08-05)


### Bug Fixes

* **block-ui:** spinner is not vertically centered ([#5](https://github.com/prosoft-edv/components/issues/5)) ([517705b](https://github.com/prosoft-edv/components/commit/517705b))
* renamed interface name ([401da66](https://github.com/prosoft-edv/components/commit/401da66))


### Features

* **block-ui:** loading overlay component ([#3](https://github.com/prosoft-edv/components/issues/3)) ([058974f](https://github.com/prosoft-edv/components/commit/058974f))
* **form:** form component ([#4](https://github.com/prosoft-edv/components/issues/4)) ([d898086](https://github.com/prosoft-edv/components/commit/d898086))
* **form-errors:** form-errors component ([2d6013d](https://github.com/prosoft-edv/components/commit/2d6013d))
* **form-field:** mat-form-field wrapper for better control compat ([7169fa8](https://github.com/prosoft-edv/components/commit/7169fa8))
* **savebar:** implemented hide mode and made change detector public ([#6](https://github.com/prosoft-edv/components/issues/6)) ([e2bfd67](https://github.com/prosoft-edv/components/commit/e2bfd67))
* **savebar:** shows form errors and save/cancel buttons ([#2](https://github.com/prosoft-edv/components/issues/2)) ([3af87be](https://github.com/prosoft-edv/components/commit/3af87be))





## [0.0.2-alpha.2](https://github.com/prosoft-edv/components/compare/@prosoft/components@0.0.2-alpha.1...@prosoft/components@0.0.2-alpha.2) (2019-06-19)


### Bug Fixes

* **select:** fixed ngModel bindings ([2219e35](https://github.com/prosoft-edv/components/commit/2219e35))
* **select:** valueChanges triggers twice when selecting an option ([e78da66](https://github.com/prosoft-edv/components/commit/e78da66))


### Features

* **select:** added support for errorStateMatcher input ([f1e53c6](https://github.com/prosoft-edv/components/commit/f1e53c6))


### Performance Improvements

* **select:** reduced amount of change detection runs ([9936940](https://github.com/prosoft-edv/components/commit/9936940))





## [0.0.2-alpha.1](https://github.com/prosoft-edv/components/compare/@prosoft/components@0.0.2-alpha.0...@prosoft/components@0.0.2-alpha.1) (2019-06-18)

**Note:** Version bump only for package @prosoft/components





## 0.0.2-alpha.0 (2019-06-18)


### Features

* **select:** custom options templates ([11b0b76](https://github.com/prosoft-edv/components/commit/11b0b76))
* changed OptionsPsSelectService to allow array/observable ([14ff342](https://github.com/prosoft-edv/components/commit/14ff342))
* **select:** ps-select dataSource can now be an options object ([6b0d2a7](https://github.com/prosoft-edv/components/commit/6b0d2a7))
* flip-container component ([3825ef7](https://github.com/prosoft-edv/components/commit/3825ef7))
* ps-select component ([9bd4521](https://github.com/prosoft-edv/components/commit/9bd4521))
