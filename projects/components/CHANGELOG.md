# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
