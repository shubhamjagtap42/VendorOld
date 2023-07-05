import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { VendorMngServiceService } from 'src/app/vendor-mng-service.service';
import { TemplateService } from '../../template.service';
import { TemplatebuilderService } from '../templatebuilder.service';
import { CombineCategoryDialogComponent } from './combine-category-dialog/combine-category-dialog.component';
import { EditOperationDialogComponent } from './edit-operation-dialog/edit-operation-dialog.component';
import { Category, ProductDEMO } from './product-interface';
import { SaveAsDraftDialogComponent } from './save-as-draft-dialog/save-as-draft-dialog.component';
import { SearchOperationDialogComponent } from './search-operation-dialog/search-operation-dialog.component';

@Component({
  selector: 'app-template-demo',
  templateUrl: './template-demo.component.html',
  styleUrls: ['./template-demo.component.css'],
  providers: [ConfirmationService, MessageService],
})
export class TemplateDemoComponent implements OnInit {
  productsData!: ProductDEMO[];
  categories!: Category[];
  productsForm!: FormGroup;
  saveAsDraftForm!: FormGroup;
  searchTerm!: string;
  categoriesData: any = [];
  loadView: boolean = false;
  saveButton: boolean = true;
  saveAsDraftButton: boolean = true;
  isDraftRedirect: boolean = false;

  draftDialog: boolean = false;
  draftVersionPattern = '^-?\\d*\\.?\\d*\\.?\\d+$';

  templateDescription: any;
  // draftVersionPattern= '^[0-9]*$';

  constructor(
    private templateBuilderService: TemplatebuilderService,
    private templateService: TemplateService,
    private vendorService: VendorMngServiceService,
    public dialog: MatDialog,
    private messageService: MessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.templateDescription = this.vendorService.templateDescriptionData;
    // console.log(
    //   'this.vendorService.templateDescriptionData: ',
    //   this.vendorService.templateDescriptionData
    // );

    if (this.activatedRoute.snapshot.params['draftId']) {
      this.vendorService.isDraftRedirect = true;
    } else {
      this.vendorService.isDraftRedirect = false;
    }
    // console.log(
    //   'this.vendorService.draftTemplateDetails: ',
    //   this.vendorService.draftTemplateDetails
    // );

    this.isDraftRedirect = this.vendorService.isDraftRedirect;
    // console.log('this.isDraftRedirect: ', this.isDraftRedirect);
    if (this.vendorService.templateDescriptionData) {
      this.saveButton = false;
      this.saveAsDraftButton = false;
    }
    this.templateService.getCategoriesData().subscribe((categgoryData: any) => {
      this.loadView = true;

      this.categoriesData =
        this.templateService.transformCategoryData(categgoryData);
      // console.log('this.categoriesData: ', this.categoriesData);
      // this.categoriesData=this.categoriesData.sort((a:any, b:any) => {
      //   if (a.name < b.name) return -1;
      //   if (a.name > b.name) return 1;
      //   return 0;
      // });

      for (let i = 0; i < this.categoriesData.length; i++) {
        this.categoriesData[i].states = this.categoriesData[i].states.sort(
          (a: any, b: any) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
          }
        );
      }
      this.initForm();

      if (
        this.isDraftRedirect &&
        this.vendorService.draftTemplateDetails.templateData
      ) {
        this.populateData(this.vendorService.draftTemplateDetails.templateData);
      }
      this.getCategoryControls().valueChanges.subscribe(console.log);

      this.subscribeOperation();
    });

    this.saveAsDraftForm = new FormGroup({
      draftVersion: new FormControl('', [
        Validators.required,
        Validators.pattern(this.draftVersionPattern),
      ]),
      draftTag: new FormControl('', [Validators.required]),
    });

    // draft form
    // this.saveAsDraftForm = new FormGroup({
    //   draftVersion: new FormControl('', [Validators.required]),
    //   draftTag: new FormControl('', [Validators.required]),
    // });
  }

  onClickBack() {
    this.location.back();
  }
  private initForm(): void {
    this.productsForm = new FormGroup(
      {
        nodeId: new FormControl(this.templateService.getRandomNodeId()),
        id: new FormControl(''),
        category: new FormArray([
          new FormGroup({
            nodeId: new FormControl(this.templateService.getRandomNodeId()),
            name: new FormControl(''),
            weightage: new FormControl('100.00'),
            subcategory: new FormArray([
              new FormGroup({
                nodeId: new FormControl(this.templateService.getRandomNodeId()),
                subcategoryname: new FormControl(''),
                weightage: new FormControl('100.00'),
                subcategoryTwo: new FormArray([
                  new FormGroup({
                    nodeId: new FormControl(
                      this.templateService.getRandomNodeId()
                    ),
                    subcategoryname: new FormControl(''),
                    weightage: new FormControl('100.00'),
                    subcategoryThree: new FormArray([
                      new FormGroup({
                        nodeId: new FormControl(
                          this.templateService.getRandomNodeId()
                        ),
                        subcategoryname: new FormControl(''),
                        weightage: new FormControl('100.00'),
                        parameter: new FormArray([
                          new FormGroup({
                            nodeId: new FormControl(
                              this.templateService.getRandomNodeId()
                            ),
                            parametername: new FormControl(''),
                            weightage: new FormControl('100.00'),
                            maxschore: new FormControl(''),
                            schoringcriteria: new FormArray([
                              new FormGroup({
                                nodeId: new FormControl(
                                  this.templateService.getRandomNodeId()
                                ),
                                criteriaValue: new FormControl(''),
                              }),
                            ]),
                          }),
                        ]),
                      }),
                    ]),
                  }),
                ]),
              }),
            ]),
          }),
        ]),
      } /*{
      validators: [this.templateValidations.RunValidation()],
      updateOn: 'submit',
    }*/
    );
  }

  getProductsData(): void {
    this.templateBuilderService.getProduct().subscribe((response: any) => {
      this.productsData = response;
      this.categories = this.productsData[0].category;
    });
  }

  getCategoryControls(): FormArray {
    return this.productsForm.get('category') as FormArray;
  }

  getSubCategoryControls(index: number): FormArray {
    return this.getCategoryControls().at(index).get('subcategory') as FormArray;
  }

  getSubCategoryTwoControls(categoryIndex: number, index: number): FormArray {
    return this.getSubCategoryControls(categoryIndex)
      .at(index)
      .get('subcategoryTwo') as FormArray;
  }

  getSubCategoryThreeControls(
    categoryIndex: number,
    subCategoryIndex: number,
    index: number
  ): FormArray {
    return this.getSubCategoryTwoControls(categoryIndex, subCategoryIndex)
      .at(index)
      .get('subcategoryThree') as FormArray;
  }

  getParameterControls(
    categoryIndex: number,
    subCategoryIndex: number,
    subCategoryTwoIndex: number,
    index: number
  ): FormArray {
    return this.getSubCategoryThreeControls(
      categoryIndex,
      subCategoryIndex,
      subCategoryTwoIndex
    )
      .at(index)
      .get('parameter') as FormArray;
  }

  getScoringCriteriaControls(
    categoryIndex: number,
    subCategoryIndex: number,
    subCategoryTwoIndex: number,
    subCategoryThreeIndex: number,
    index: number
  ): FormArray {
    return this.getParameterControls(
      categoryIndex,
      subCategoryIndex,
      subCategoryTwoIndex,
      subCategoryThreeIndex
    )
      .at(index)
      .get('schoringcriteria') as FormArray;
  }

  addCategory(): void {
    let rowCount: any = prompt('How many categories you want to create ?');

    const calculateWeightage = Math.floor(
      100 / ((this.productsForm.get('category') as FormArray).length + rowCount)
    );
    // console.log(calculateWeightage);
    let i = 0;
    while (i < rowCount) {
      (this.productsForm.get('category') as FormArray).push(
        new FormGroup({
          nodeId: new FormControl(this.templateService.getRandomNodeId()),
          name: new FormControl(''),
          weightage: new FormControl([calculateWeightage]),
          subcategory: new FormArray([
            new FormGroup({
              nodeId: new FormControl(this.templateService.getRandomNodeId()),
              subcategoryname: new FormControl(''),
              weightage: new FormControl('100.00'),
              subcategoryTwo: new FormArray([
                new FormGroup({
                  nodeId: new FormControl(
                    this.templateService.getRandomNodeId()
                  ),
                  subcategoryname: new FormControl(''),
                  weightage: new FormControl('100.00'),
                  subcategoryThree: new FormArray([
                    new FormGroup({
                      nodeId: new FormControl(
                        this.templateService.getRandomNodeId()
                      ),
                      subcategoryname: new FormControl(''),
                      weightage: new FormControl('100.00'),
                      parameter: new FormArray([
                        new FormGroup({
                          nodeId: new FormControl(
                            this.templateService.getRandomNodeId()
                          ),
                          parametername: new FormControl(''),
                          weightage: new FormControl('100.00'),
                          maxschore: new FormControl(''),
                          schoringcriteria: new FormArray([
                            new FormGroup({
                              nodeId: new FormControl(
                                this.templateService.getRandomNodeId()
                              ),
                              criteriaValue: new FormControl(''),
                            }),
                          ]),
                        }),
                      ]),
                    }),
                  ]),
                }),
              ]),
            }),
          ]),
        })
      );

      i++;
    }

    this.calculateWeightage(this.productsForm.get('category') as FormArray);
  }
  addSingleCategory(): void {
    let rowCount: any = 1;

    const calculateWeightage = Math.floor(
      100 / ((this.productsForm.get('category') as FormArray).length + rowCount)
    );
    // console.log(calculateWeightage);
    let i = 0;
    while (i < rowCount) {
      (this.productsForm.get('category') as FormArray).push(
        new FormGroup({
          nodeId: new FormControl(this.templateService.getRandomNodeId()),
          name: new FormControl(''),
          weightage: new FormControl([calculateWeightage]),
          subcategory: new FormArray([
            new FormGroup({
              nodeId: new FormControl(this.templateService.getRandomNodeId()),
              subcategoryname: new FormControl(''),
              weightage: new FormControl('100.00'),
              subcategoryTwo: new FormArray([
                new FormGroup({
                  nodeId: new FormControl(
                    this.templateService.getRandomNodeId()
                  ),
                  subcategoryname: new FormControl(''),
                  weightage: new FormControl('100.00'),
                  subcategoryThree: new FormArray([
                    new FormGroup({
                      nodeId: new FormControl(
                        this.templateService.getRandomNodeId()
                      ),
                      subcategoryname: new FormControl(''),
                      weightage: new FormControl('100.00'),
                      parameter: new FormArray([
                        new FormGroup({
                          nodeId: new FormControl(
                            this.templateService.getRandomNodeId()
                          ),
                          parametername: new FormControl(''),
                          weightage: new FormControl('100.00'),
                          maxschore: new FormControl(''),
                          schoringcriteria: new FormArray([
                            new FormGroup({
                              nodeId: new FormControl(
                                this.templateService.getRandomNodeId()
                              ),
                              criteriaValue: new FormControl(''),
                            }),
                          ]),
                        }),
                      ]),
                    }),
                  ]),
                }),
              ]),
            }),
          ]),
        })
      );

      i++;
    }

    this.calculateWeightage(this.productsForm.get('category') as FormArray);
  }

  removeCategory(index: number): void {
    (this.productsForm.get('category') as FormArray).removeAt(index);
    this.calculateWeightage(this.productsForm.get('category') as FormArray);
  }

  addSubCategory(categoryIndex: number): void {
    let rowCount: any = prompt('How many Sub categories you want to create ?');

    let i = 0;
    while (i < rowCount) {
      this.getSubCategoryControls(categoryIndex).push(
        new FormGroup({
          nodeId: new FormControl(this.templateService.getRandomNodeId()),
          subcategoryname: new FormControl(''),
          weightage: new FormControl('100.00'),
          subcategoryTwo: new FormArray([
            new FormGroup({
              nodeId: new FormControl(this.templateService.getRandomNodeId()),
              subcategoryname: new FormControl(''),
              weightage: new FormControl('100.00'),
              subcategoryThree: new FormArray([
                new FormGroup({
                  nodeId: new FormControl(
                    this.templateService.getRandomNodeId()
                  ),
                  subcategoryname: new FormControl(''),
                  weightage: new FormControl('100.00'),
                  parameter: new FormArray([
                    new FormGroup({
                      nodeId: new FormControl(
                        this.templateService.getRandomNodeId()
                      ),
                      parametername: new FormControl(''),
                      weightage: new FormControl('100.00'),
                      maxschore: new FormControl(''),
                      schoringcriteria: new FormArray([
                        new FormGroup({
                          nodeId: new FormControl(
                            this.templateService.getRandomNodeId()
                          ),
                          criteriaValue: new FormControl(''),
                        }),
                      ]),
                    }),
                  ]),
                }),
              ]),
            }),
          ]),
        })
      );
      i++;
    }

    this.calculateWeightage(this.getSubCategoryControls(categoryIndex));
  }

  removeSubCategory(categoryIndex: number, index: number): void {
    (
      this.getCategoryControls()
        .at(categoryIndex)
        .get('subcategory') as FormArray
    ).removeAt(index);
    this.calculateWeightage(this.getSubCategoryControls(categoryIndex));
  }

  addSubCategoryTwo(categoryIndex: number, subCategoryIndex: number): void {
    let rowCount: any = prompt('How many Sub categories you want to create ?');

    let i = 0;
    while (i < rowCount) {
      this.getSubCategoryTwoControls(categoryIndex, subCategoryIndex).push(
        new FormGroup({
          nodeId: new FormControl(this.templateService.getRandomNodeId()),
          subcategoryname: new FormControl(),
          weightage: new FormControl('100.00'),
          subcategoryThree: new FormArray([
            new FormGroup({
              nodeId: new FormControl(this.templateService.getRandomNodeId()),
              subcategoryname: new FormControl(''),
              weightage: new FormControl('100.00'),
              parameter: new FormArray([
                new FormGroup({
                  nodeId: new FormControl(
                    this.templateService.getRandomNodeId()
                  ),
                  parametername: new FormControl(''),
                  weightage: new FormControl('100.00'),
                  maxschore: new FormControl(''),
                  schoringcriteria: new FormArray([
                    new FormGroup({
                      nodeId: new FormControl(
                        this.templateService.getRandomNodeId()
                      ),
                      criteriaValue: new FormControl(''),
                    }),
                  ]),
                }),
              ]),
            }),
          ]),
        })
      );
      i++;
    }

    this.calculateWeightage(
      this.getSubCategoryTwoControls(categoryIndex, subCategoryIndex)
    );
  }

  removeSubCategoryTwo(
    categoryIndex: number,
    subCategoryIndex: number,
    index: number
  ): void {
    (
      this.getSubCategoryTwoControls(
        categoryIndex,
        subCategoryIndex
      ) as FormArray
    ).removeAt(index);
    this.calculateWeightage(
      this.getSubCategoryTwoControls(categoryIndex, subCategoryIndex)
    );
  }

  addSubCategoryThree(
    categoryIndex: number,
    subCategoryIndex: number,
    subCategoryTwoIndex: number
  ): void {
    let rowCount: any = prompt('How many Sub categories you want to create ?');

    let i = 0;
    while (i < rowCount) {
      this.getSubCategoryThreeControls(
        categoryIndex,
        subCategoryIndex,
        subCategoryTwoIndex
      ).push(
        new FormGroup({
          nodeId: new FormControl(this.templateService.getRandomNodeId()),
          subcategoryname: new FormControl(),
          weightage: new FormControl('100.00'),
          parameter: new FormArray([
            new FormGroup({
              nodeId: new FormControl(this.templateService.getRandomNodeId()),
              parametername: new FormControl(''),
              weightage: new FormControl('100.00'),
              maxschore: new FormControl(''),
              schoringcriteria: new FormArray([
                new FormGroup({
                  nodeId: new FormControl(
                    this.templateService.getRandomNodeId()
                  ),
                  criteriaValue: new FormControl(''),
                }),
              ]),
            }),
          ]),
        })
      );
      i++;
    }

    this.calculateWeightage(
      this.getSubCategoryThreeControls(
        categoryIndex,
        subCategoryIndex,
        subCategoryTwoIndex
      )
    );
  }

  removeSubCategoryThree(
    categoryIndex: number,
    subCategoryIndex: number,
    subCategoryTwoIndex: number,
    index: number
  ): void {
    (
      this.getSubCategoryThreeControls(
        categoryIndex,
        subCategoryIndex,
        subCategoryTwoIndex
      ) as FormArray
    ).removeAt(index);
    this.calculateWeightage(
      this.getSubCategoryThreeControls(
        categoryIndex,
        subCategoryIndex,
        subCategoryTwoIndex
      )
    );
  }

  addParameter(
    categoryIndex: number,
    subCategoryIndex: number,
    subCategoryTwoIndex: number,
    subCategoryThreeIndex: number
  ): void {
    let rowCount: any = prompt('How many Parameters you want to create ?');

    let i = 0;
    while (i < rowCount) {
      this.getParameterControls(
        categoryIndex,
        subCategoryIndex,
        subCategoryTwoIndex,
        subCategoryThreeIndex
      ).push(
        new FormGroup({
          nodeId: new FormControl(this.templateService.getRandomNodeId()),
          parametername: new FormControl(),
          weightage: new FormControl('100.00'),
          maxschore: new FormControl(''),
          schoringcriteria: new FormArray([
            new FormGroup({
              nodeId: new FormControl(this.templateService.getRandomNodeId()),
              criteriaValue: new FormControl(''),
            }),
          ]),
        })
      );

      i++;
    }

    this.calculateWeightage(
      this.getParameterControls(
        categoryIndex,
        subCategoryIndex,
        subCategoryTwoIndex,
        subCategoryThreeIndex
      )
    );
  }

  removeParameter(
    categoryIndex: number,
    subCategoryIndex: number,
    subCategoryTwoIndex: number,
    subCategoryThreeIndex: number,
    index: number
  ): void {
    this.getParameterControls(
      categoryIndex,
      subCategoryIndex,
      subCategoryTwoIndex,
      subCategoryThreeIndex
    ).removeAt(index);
    this.calculateWeightage(
      this.getParameterControls(
        categoryIndex,
        subCategoryIndex,
        subCategoryTwoIndex,
        subCategoryThreeIndex
      )
    );
  }

  addScoringCriteria(
    categoryIndex: number,
    subCategoryIndex: number,
    subCategoryTwoIndex: number,
    subCategoryThreeIndex: number,
    parameterIndex: number
  ): void {
    let rowCount: any = prompt(
      'How many scoring criteria you want to create ?'
    );

    let i = 0;
    while (i < rowCount) {
      this.getScoringCriteriaControls(
        categoryIndex,
        subCategoryIndex,
        subCategoryTwoIndex,
        subCategoryThreeIndex,
        parameterIndex
      ).push(
        new FormGroup({
          nodeId: new FormControl(this.templateService.getRandomNodeId()),
          criteriaValue: new FormControl(''),
        })
      );
      i++;
    }
  }

  removeScoringCriteria(
    categoryIndex: number,
    subCategoryIndex: number,
    subCategoryTwoIndex: number,
    subCategoryThreeIndex: number,
    parameterIndex: number,
    index: number
  ): void {
    this.getScoringCriteriaControls(
      categoryIndex,
      subCategoryIndex,
      subCategoryTwoIndex,
      subCategoryThreeIndex,
      parameterIndex
    ).removeAt(index);
  }

  private calculateWeightage(list: FormArray, validation?: boolean): void {
    let newWeightage = (100 / list.length).toFixed(2);

    list.controls.forEach((control: any, index: number) => {
      (control as FormGroup).patchValue({
        weightage: newWeightage,
      });
    });

    this.weightageValidation(list, false, true);
  }

  private weightageValidation(
    list: FormArray,
    validation: boolean = false,
    patchValue: boolean = false
  ): void {
    let totalWeightage: number = 0;

    list.controls.forEach((control: any, index: number) => {
      if (!validation) {
        if (index == list.controls.length - 1 && index > 0) {
          let weightage = control.value.weightage;
          if (patchValue) {
            weightage = (100 - totalWeightage).toFixed(2);
            (control as FormGroup).patchValue({
              weightage: weightage,
            });
          }

          totalWeightage = totalWeightage + Number(weightage);
        } else {
          totalWeightage =
            Number(totalWeightage) + Number(control.value.weightage);
        }
      } else {
        totalWeightage =
          Number(totalWeightage) + Number(control.value.weightage);
      }
    });

    list.controls.forEach((control: any) => {
      if (totalWeightage != 100) {
        (control as FormGroup).setErrors({
          weightageError: true,
        });
      } else {
        (control as FormGroup).setErrors({
          weightageError: false,
        });
      }
    });
  }

  private prepareSubCategoryControl(category: any, data?: any) {
    let categoryControls: any = new FormArray([]);
    category.subcategory.forEach((subcategory: any) => {
      categoryControls.push(
        new FormGroup({
          nodeId: new FormControl(this.templateService.getRandomNodeId()),
          subcategoryname: new FormControl(subcategory.subcategoryname),
          weightage: new FormControl('100.00'),
          subcategoryTwo: this.prepareSubCategoryTwoControl(subcategory),
        })
      );
    });
    this.calculateWeightage(categoryControls);
    return categoryControls;
  }

  private prepareSubCategoryTwoControl(subcategory: any, data?: any) {
    let subcategoryTwoControls: any = new FormArray([]);
    subcategory.subcategoryTwo.forEach((subcategoryTwo: any) => {
      subcategoryTwoControls.push(
        new FormGroup({
          nodeId: new FormControl(this.templateService.getRandomNodeId()),
          subcategoryname: new FormControl(subcategoryTwo.subcategoryname),
          weightage: new FormControl('100.00'),
          subcategoryThree: this.prepareSubCategoryThreeControl(subcategoryTwo),
        })
      );
    });
    this.calculateWeightage(subcategoryTwoControls);
    return subcategoryTwoControls;
  }

  private prepareSubCategoryThreeControl(subcategoryTwo: any, data?: any) {
    let subcategoryThreeControls: any = new FormArray([]);
    subcategoryTwo.subcategoryThree.forEach((subcategoryThree: any) => {
      // console.log(
      //   'subcategoryThree.subcategoryname: ',
      //   subcategoryThree.subcategoryname
      // );
      subcategoryThreeControls.push(
        new FormGroup({
          nodeId: new FormControl(this.templateService.getRandomNodeId()),
          subcategoryname: new FormControl(subcategoryThree.subcategoryname),
          weightage: new FormControl('100.00'),
          parameter: this.prepareParameterControl(subcategoryThree),
        })
      );
    });
    this.calculateWeightage(subcategoryThreeControls);
    return subcategoryThreeControls;
  }

  private prepareParameterControl(subcategoryThree: any, data?: any) {
    let parameterControls: any = new FormArray([]);
    subcategoryThree.parameter.forEach((parameter: any) => {
      parameterControls.push(
        new FormGroup({
          nodeId: new FormControl(this.templateService.getRandomNodeId()),
          parametername: new FormControl(parameter.parametername),
          weightage: new FormControl('100.00'),
          maxschore: new FormControl(''),
          schoringcriteria: this.prepareScoringCriteriaControl(parameter),
        })
      );
    });
    this.calculateWeightage(parameterControls);
    return parameterControls;
  }

  private prepareScoringCriteriaControl(parameter: any) {
    let scoringCriteriaControls: any = new FormArray([]);
    parameter.schoringcriteria.forEach((schoringcriteria: any) => {
      scoringCriteriaControls.push(
        new FormGroup({
          nodeId: new FormControl(this.templateService.getRandomNodeId()),
          criteriaValue: new FormControl(schoringcriteria.criteriaValue),
        })
      );
    });
    return scoringCriteriaControls;
  }

  openDialog(data: any) {
    this.dialog.open(CombineCategoryDialogComponent, {
      data: {
        input: data,
      },
    });
  }

  initCombine(
    categoryIndex: number,
    operation: string,
    subCategoryIndex?: any,
    subCategoryTwoIndex?: any,
    subCategoryThreeIndex?: any,
    parameterIndex?: any
  ): void {
    let data = this.getCategoryControls().value;
    let newData: any;

    switch (operation) {
      case 'category':
        newData = data.filter((row: any, index: number) => {
          if (row.name != data[categoryIndex].name) {
            return row.name;
          }
        });
        break;
      case 'subCategory':
        newData = this.getDropdownSubCategoryList(
          data[categoryIndex].subcategory[subCategoryIndex].subcategoryname,
          data,
          operation
        );
        break;
      case 'subCategoryTwo':
        newData = this.getDropdownSubCategoryList(
          data[categoryIndex].subcategory[subCategoryIndex].subcategoryTwo[
            subCategoryTwoIndex
          ].subcategoryname,
          data,
          operation
        );
        break;
      case 'subCategoryThree':
        newData = this.getDropdownSubCategoryList(
          data[categoryIndex].subcategory[subCategoryIndex].subcategoryTwo[
            subCategoryTwoIndex
          ].subcategoryThree[subCategoryThreeIndex].subcategoryname,
          data,
          operation
        );
        break;
      case 'parameter':
        newData = this.getDropdownSubCategoryList(
          data[categoryIndex].subcategory[subCategoryIndex].subcategoryTwo[
            subCategoryTwoIndex
          ].subcategoryThree[subCategoryThreeIndex].subcategoryname,
          data,
          'subCategoryThree'
        );
        break;
    }

    this.openDialog({
      newData: newData,
      originalData: data,
      categoryIndex: categoryIndex,
      subCategoryIndex: subCategoryIndex,
      subCategoryTwoIndex: subCategoryTwoIndex,
      subCategoryThreeIndex: subCategoryThreeIndex,
      parameterIndex: parameterIndex,
      operation: operation,
    });
  }

  private getDropdownSubCategoryList(
    value: string,
    data: any,
    operation?: any
  ): void {
    let temp: any = [];
    data.forEach((category: any) => {
      category.subcategory.forEach((subCategory: any) => {
        if (operation == 'subCategory') {
          if (subCategory.subcategoryname != value) {
            // console.log('subCategory: ', subCategory);
            temp.push({ name: subCategory.subcategoryname });
          }
        } else {
          subCategory.subcategoryTwo.forEach((subCategoryTwo: any) => {
            if (operation == 'subCategoryTwo') {
              if (subCategoryTwo.subcategoryname != value) {
                // console.log('subCategoryTwo: ', subCategoryTwo);
                temp.push({ name: subCategoryTwo.subcategoryname });
              }
            } else {
              subCategoryTwo.subcategoryThree.forEach(
                (subCategoryThree: any) => {
                  if (operation == 'subCategoryThree') {
                    if (subCategoryThree.subcategoryname != value) {
                      // console.log('subCategoryThree: ', subCategoryThree);
                      temp.push({ name: subCategoryThree.subcategoryname });
                    }
                  } else {
                    subCategoryThree.parameter.forEach((parameter: any) => {
                      if (operation == 'parameter') {
                        if (parameter.parametername != value) {
                          // console.log('parameter: ', parameter);
                          temp.push({ name: parameter.parametername });
                        }
                      }
                    });
                  }
                }
              );
            }
          });
        }
      });
    });
    return temp;
  }

  private subscribeOperation() {
    // console.log('Subscription');
    this.templateBuilderService.dialogFormDataSubscriber$.subscribe(
      (data: any) => {
        // console.log('subscription data: ', data);

        switch (data.action) {
          case 'combine':
            this.combineOperation(data);
            break;
          case 'edit':
            this.subscribeEditOperation(data);
            break;
          case 'search':
            this.subscribeSearchOperation(data);
            break;
          case 'draft':
            this.subscribeDraftOperation(data);
            break;
        }
      }
    );
  }

  private combineOperation(data: any) {
    switch (data.eventData.operation) {
      case 'category':
        this.combineCategory(data.eventData);
        break;
      case 'subCategory':
        this.combineSubCategory(data.eventData);
        break;
      case 'subCategoryTwo':
        this.combineSubCategoryTwo(data.eventData);
        break;
      case 'subCategoryThree':
        this.combineSubCategoryThree(data.eventData);
        break;
      case 'parameter':
        this.combineParameter(data.eventData);
        break;
    }
  }

  private combineCategory(data: any): void {
    // console.log('combine into index: ', data.categoryIndex);
    this.getSubCategoryControls(data.categoryIndex).value.forEach(
      (subcategory: any, subCategoryIndex: number) => {
        this.getSubCategoryControls(data.selectedIndex).push(
          new FormGroup({
            subcategoryname: new FormControl(subcategory.subcategoryname),
            weightage: new FormControl('100.00'),
            subcategoryTwo: this.prepareSubCategoryTwoControl(subcategory, {
              categoryIndex: data.categoryIndex,
              subCategoryIndex: subCategoryIndex,
            }),
          })
        );

        this.calculateWeightage(
          this.getSubCategoryControls(data.selectedIndex)
        );
      }
    );

    this.removeCategory(data.categoryIndex);
    this.dialog.closeAll();
  }

  private combineSubCategory(data: any): void {
    // console.log('combine into index: ', data.categoryIndex);
    this.getSubCategoryTwoControls(
      data.categoryIndex,
      data.subCategoryIndex
    ).value.forEach((subcategoryTwo: any, subcategoryTwoIndex: number) => {
      this.getSubCategoryTwoControls(
        data.selectedCategoryIndex,
        data.selectedIndex
      ).push(
        new FormGroup({
          subcategoryname: new FormControl(subcategoryTwo.subcategoryname),
          weightage: new FormControl('100.00'),
          subcategoryThree: this.prepareSubCategoryThreeControl(
            subcategoryTwo,
            {
              categoryIndex: data.categoryIndex,
              subcategoryTwoIndex: subcategoryTwoIndex,
            }
          ),
        })
      );

      this.calculateWeightage(
        this.getSubCategoryTwoControls(
          data.selectedCategoryIndex,
          data.selectedIndex
        )
      );
    });

    this.removeSubCategory(data.categoryIndex, data.subCategoryIndex);
    this.dialog.closeAll();
  }

  private combineSubCategoryTwo(data: any): void {
    // console.log('combine into index: ', data.categoryIndex);
    this.getSubCategoryThreeControls(
      data.categoryIndex,
      data.subCategoryIndex,
      data.subCategoryTwoIndex
    ).value.forEach((subcategoryThree: any, subcategoryThreeIndex: number) => {
      this.getSubCategoryThreeControls(
        data.selectedCategoryIndex,
        data.selectedSubCategoryIndex,
        data.selectedIndex
      ).push(
        new FormGroup({
          subcategoryname: new FormControl(subcategoryThree.subcategoryname),
          weightage: new FormControl('100.00'),
          parameter: this.prepareParameterControl(subcategoryThree, {
            categoryIndex: data.categoryIndex,
          }),
        })
      );

      this.calculateWeightage(
        this.getSubCategoryThreeControls(
          data.selectedCategoryIndex,
          data.selectedSubCategoryIndex,
          data.selectedIndex
        )
      );
    });

    this.removeSubCategoryTwo(
      data.categoryIndex,
      data.subCategoryIndex,
      data.subCategoryTwoIndex
    );
    this.dialog.closeAll();
  }

  private combineSubCategoryThree(data: any): void {
    // console.log('combine into index: ', data.categoryIndex);
    this.getParameterControls(
      data.categoryIndex,
      data.subCategoryIndex,
      data.subCategoryTwoIndex,
      data.subCategoryThreeIndex
    ).value.forEach((parameter: any, parameterIndex: number) => {
      this.getParameterControls(
        data.selectedCategoryIndex,
        data.selectedSubCategoryIndex,
        data.selectedSubCategoryTwoIndex,
        data.selectedIndex
      ).push(
        new FormGroup({
          parametername: new FormControl(parameter.parametername),
          weightage: new FormControl('100.00'),
          maxschore: new FormControl(parameter.maxschore),
          schoringcriteria: this.prepareScoringCriteriaControl(parameter),
        })
      );
    });

    this.calculateWeightage(
      this.getParameterControls(
        data.selectedCategoryIndex,
        data.selectedSubCategoryIndex,
        data.selectedSubCategoryTwoIndex,
        data.selectedIndex
      )
    );

    this.removeSubCategoryThree(
      data.categoryIndex,
      data.subCategoryIndex,
      data.subCategoryTwoIndex,
      data.subCategoryThreeIndex
    );
    this.dialog.closeAll();
  }

  private combineParameter(data: any): void {
    let parameterControl = this.getParameterControls(
      data.categoryIndex,
      data.subCategoryIndex,
      data.subCategoryTwoIndex,
      data.subCategoryThreeIndex
    ).at(data.parameterIndex);

    this.getParameterControls(
      data.selectedCategoryIndex,
      data.selectedSubCategoryIndex,
      data.selectedSubCategoryTwoIndex,
      data.selectedSubCategoryThreeIndex
    ).push(
      new FormGroup({
        parametername: new FormControl(parameterControl.value.parametername),
        weightage: new FormControl('100.00'),
        maxschore: new FormControl(parameterControl.value.maxschore),
        schoringcriteria: this.prepareScoringCriteriaControl(
          parameterControl.value
        ),
      })
    );

    this.calculateWeightage(
      this.getParameterControls(
        data.selectedCategoryIndex,
        data.selectedSubCategoryIndex,
        data.selectedSubCategoryTwoIndex,
        data.selectedIndex
      )
    );

    this.removeParameter(
      data.categoryIndex,
      data.subCategoryIndex,
      data.subCategoryTwoIndex,
      data.subCategoryThreeIndex,
      data.parameterIndex
    );
    this.dialog.closeAll();
  }

  public createCategoryCopy(index: number) {
    let categoryControl = this.getCategoryControls().at(index).value;

    (this.productsForm.get('category') as FormArray).push(
      new FormGroup({
        nodeId: new FormControl(this.templateService.getRandomNodeId()),
        name: new FormControl(categoryControl.name),
        weightage: new FormControl(categoryControl.weightage),
        subcategory: this.prepareSubCategoryControl(categoryControl),
      })
    );

    this.calculateWeightage(this.getCategoryControls());
  }

  public onEditOption(
    operation: string,
    categoryIndex?: number,
    subCategoryIndex?: number,
    subCategoryTwoIndex?: number,
    subCategoryThreeIndex?: number,
    parameterIndex?: number
  ) {
    this.dialog.open(EditOperationDialogComponent, {
      data: {
        categoriesData: this.categoriesData,
        operation: operation,
        meta: {
          categoryIndex: categoryIndex,
          subCategoryIndex: subCategoryIndex,
          subCategoryTwoIndex: subCategoryTwoIndex,
          subCategoryThreeIndex: subCategoryThreeIndex,
          parameterIndex: parameterIndex,
        },
      },
      height: 'auto',
      minHeight: '100px',
    });
  }

  public onSearchOption(
    operation: string,
    categoryIndex?: number,
    subCategoryIndex?: number,
    subCategoryTwoIndex?: number,
    subCategoryThreeIndex?: number,
    parameterIndex?: number
  ) {
    this.dialog.open(SearchOperationDialogComponent, {
      data: {
        categoriesData: this.categoriesData,
        operation: operation,
        meta: {
          categoryIndex: categoryIndex,
          subCategoryIndex: subCategoryIndex,
          subCategoryTwoIndex: subCategoryTwoIndex,
          subCategoryThreeIndex: subCategoryThreeIndex,
          parameterIndex: parameterIndex,
        },
      },
      height: 'auto',
      minHeight: '100px',
    });
  }

  private subscribeEditOperation(data: any) {
    // console.log('Edit subscription data: ', data);
    this.patchValue(data);
    this.dialog.closeAll();
  }

  private subscribeSearchOperation(data: any) {
    // console.log('Search subscription data: ', data);
    this.patchValue(data);
    this.dialog.closeAll();
  }

  private patchValue(data: any) {
    switch (data.operation) {
      case 'category':
        this.getCategoryControls()
          .at(data.meta.categoryIndex)
          .get('name')
          ?.patchValue(data.fieldValue);
        break;
      case 'subCategory':
        this.getSubCategoryControls(data.meta.categoryIndex)
          .at(data.meta.subCategoryIndex)
          .get('subcategoryname')
          ?.patchValue(data.fieldValue);
        break;
      case 'subCategoryTwo':
        this.getSubCategoryTwoControls(
          data.meta.categoryIndex,
          data.meta.subCategoryIndex
        )
          .at(data.meta.subCategoryTwoIndex)
          .get('subcategoryname')
          ?.patchValue(data.fieldValue);
        break;
      case 'subCategoryThree':
        this.getSubCategoryThreeControls(
          data.meta.categoryIndex,
          data.meta.subCategoryIndex,
          data.meta.subCategoryTwoIndex
        )
          .at(data.meta.subCategoryThreeIndex)
          .get('subcategoryname')
          ?.patchValue(data.fieldValue);
        break;
      case 'parameter':
        this.getParameterControls(
          data.meta.categoryIndex,
          data.meta.subCategoryIndex,
          data.meta.subCategoryTwoIndex,
          data.meta.subCategoryThreeIndex
        )
          .at(data.meta.parameterIndex)
          .get('parametername')
          ?.patchValue(data.fieldValue);
        break;
    }
  }

  validateWeightage(
    categoryIndex: number,
    operation: string,
    subCategoryIndex?: number,
    subCategoryTwoIndex?: number,
    subCategoryThreeIndex?: number
  ) {
    // console.log('validateCategoryWeightage: ', categoryIndex);
    let totalWeightage: number = 0;

    switch (operation) {
      case 'category':
        this.weightageValidation(this.getCategoryControls(), true);
        break;
      case 'subCategory':
        this.weightageValidation(this.getSubCategoryControls(categoryIndex));
        break;
      case 'subCategoryTwo':
        this.weightageValidation(
          this.getSubCategoryTwoControls(categoryIndex, subCategoryIndex!)
        );
        break;
      case 'subCategoryThree':
        this.weightageValidation(
          this.getSubCategoryThreeControls(
            categoryIndex,
            subCategoryIndex!,
            subCategoryTwoIndex!
          )
        );
        break;
      case 'parameter':
        this.weightageValidation(
          this.getParameterControls(
            categoryIndex,
            subCategoryIndex!,
            subCategoryTwoIndex!,
            subCategoryThreeIndex!
          )
        );
        break;
    }
  }

  onSave() {
    // console.log(
    //   this.vendorService.templateDescriptionData.projectName,
    //   ' project data...!!'
    // );
    if (this.vendorService.templateDescriptionData != null) {
      const data = {
        templateDescription: this.vendorService.templateDescriptionData,
        project: this.vendorService.templateDescriptionData.projectName,
        templateData: JSON.stringify(this.getCategoryControls().value),
        status: 'Pending',
      };

      // console.log(data.templateData, ' template to be added');

      this.templateService.addTemplateData(data).subscribe(
        (result: any) => {
          // console.log('Template added', result);

          this.messageService.add({
            severity: 'success',
            summary: 'Success...!!',
            detail: 'Template created successfully',
          });

          this.deleteDraftTemplate();
          setTimeout(() => {
            this.router.navigate(['/BusinessUser/template-list']);
          }, 1300);
        },
        (error: HttpErrorResponse) => {
          if (error.status === 500) {
            // alert("template already exist for the project:"+this.vendorService.project.projectName)
            // alert('Something went wrong, please try again later');
            this.messageService.add({
              severity: 'error',
              summary: 'Error...!!',
              detail: 'Something went wrong, please try again later',
            });
          }
        }
      );
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error...!!',
        detail: 'Something went wrong, please try again later',
      });
    }
  }

  private deleteDraftTemplate() {
    let draftId = this.activatedRoute.snapshot.params['draftId'];
    if (draftId) {
      this.templateService
        .deleteDraftTemplate(draftId)
        .subscribe((result: any) => {
          // console.log(draftId + ' deleted successfully.');
          // this.messageService.add({
          //   severity: 'success',
          //   summary: 'success...!!',
          //   detail: draftId + ' deleted successfully.',
          // });
        });
    }

    setTimeout(() => {
      this.ngOnInit();
    }, 1300);
  }

  onClickDraft() {
    // this.dialog.open(SaveAsDraftDialogComponent, {
    //   data: {},
    //   height: 'auto',
    //   minHeight: '100px',
    // });

    this.draftDialog = true;
  }

  subscribeDraftOperation(data: any) {
    let request: any = {
      draftVerion: Number(data.saveAsDraftForm.draftVerion),
      draftTag: data.saveAsDraftForm.draftTag,
      templateDescription: this.vendorService.templateDescriptionData,
      status: 'Pending',
      templateData: JSON.stringify(this.getCategoryControls().value),
    };

    if (
      this.isDraftRedirect &&
      this.vendorService.draftTemplateDetails.draftId
    ) {
      request['draftId'] = this.vendorService.draftTemplateDetails.draftId;
    }
    // console.log('request: ', JSON.stringify(request));

    if (this.isDraftRedirect) {
      this.templateService.updateAsDraft(request).subscribe((res: any) => {
        // console.log(res);
        this.router.navigate(['/BusinessUser/template-list']);
        this.dialog.closeAll();
      });
    } else {
      this.templateService.saveAsDraft(request).subscribe((res: any) => {
        // console.log(res);
        this.router.navigate(['/BusinessUser/template-list']);
        this.dialog.closeAll();
      });
    }
  }

  onClickSave() {
    // console.log(this.saveAsDraftForm.value,'inside draft ',this.vendorService);

    if (!this.isDraftRedirect) {
      // console.log("check 1");

      let request = {
        draftVerion: this.saveAsDraftForm.value.draftVersion,
        draftTag: this.saveAsDraftForm.value.draftTag,
        projectId:
          this.vendorService.templateDescriptionData.projectName.projectId,
        projectDraft: this.vendorService.templateDescriptionData.projectName,
        templateDescription: this.vendorService.templateDescriptionData,
        status: 'Pending',
        templateData: JSON.stringify(this.getCategoryControls().value),
      };

      // console.log(JSON.stringify(request), ' data after save as draft ');
      this.templateService.saveAsDraft(request).subscribe((data: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successfull',
          detail: 'Data saved as a draft',
        });

        // console.log(data, ' data to be saved as a draft');
        this.draftDialog = false;
        setTimeout(() => {
          this.router.navigate(['/BusinessUser/template-list']);
        }, 1300);
      });
    } else {
      // console.log("check 2");

      let request = {
        draftId: this.vendorService.draftTemplateDetails.draftId,
        draftVerion: this.saveAsDraftForm.value.draftVersion,
        draftTag: this.saveAsDraftForm.value.draftTag,
        projectId: this.vendorService.project.projectId,
        projectDraft: this.vendorService.project,
        templateDescription: this.vendorService.templateDescriptionData,
        status: 'Pending',
        templateData: JSON.stringify(this.getCategoryControls().value),
      };

      // console.log(request, ' edit draft..../././././');

      // console.log(JSON.stringify(request), ' data after save as draft');
      this.templateService.updateAsDraft(request).subscribe(
        (data: any) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successfull',
            detail: `${data.draftId} Data saved as a draft`,
          });
          this.draftDialog = false;
          setTimeout(() => {
            this.router.navigate(['/BusinessUser/template-list']);
          }, 1300);
        },
        (error: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error...!!',
            detail: `Error while updating a draft, please try again..!!`,
          });
        }
      );
    }
  }

  /* View Template */

  populateData(data: any) {
    let controls: any = new FormArray([]);
    data.forEach((categoryControl: any, index: number) => {
      controls.push(
        new FormGroup({
          nodeId: new FormControl(categoryControl.nodeId),
          badgeCount: new FormControl(categoryControl.badgeCount),
          name: new FormControl(categoryControl.name),
          weightage: new FormControl(categoryControl.weightage),
          subcategory: this.prepareSubCategoryControlView(categoryControl),
        })
      );
    });

    this.productsForm = new FormGroup({ category: controls });
    // console.log(this.productsForm);
  }

  private prepareSubCategoryControlView(category: any) {
    let categoryControls: any = new FormArray([]);
    category.subcategory.forEach((subcategory: any) => {
      categoryControls.push(
        new FormGroup({
          nodeId: new FormControl(subcategory.nodeId),
          badgeCount: new FormControl(subcategory.badgeCount),
          subcategoryname: new FormControl(subcategory.subcategoryname),
          weightage: new FormControl(subcategory.weightage),
          subcategoryTwo: this.prepareSubCategoryTwoControlView(subcategory),
        })
      );
    });
    return categoryControls;
  }

  private prepareSubCategoryTwoControlView(subcategory: any) {
    let subcategoryTwoControls: any = new FormArray([]);
    subcategory.subcategoryTwo.forEach((subcategoryTwo: any) => {
      subcategoryTwoControls.push(
        new FormGroup({
          nodeId: new FormControl(subcategoryTwo.nodeId),
          badgeCount: new FormControl(subcategoryTwo.badgeCount),
          subcategoryname: new FormControl(subcategoryTwo.subcategoryname),
          weightage: new FormControl(subcategoryTwo.weightage),
          subcategoryThree:
            this.prepareSubCategoryThreeControlView(subcategoryTwo),
        })
      );
    });
    return subcategoryTwoControls;
  }

  private prepareSubCategoryThreeControlView(subcategoryTwo: any) {
    let subcategoryThreeControls: any = new FormArray([]);
    subcategoryTwo.subcategoryThree.forEach((subcategoryThree: any) => {
      // console.log(
      //   'subcategoryThree.subcategoryname: ',
      //   subcategoryThree.subcategoryname
      // );
      subcategoryThreeControls.push(
        new FormGroup({
          nodeId: new FormControl(subcategoryThree.nodeId),
          badgeCount: new FormControl(subcategoryThree.badgeCount),
          subcategoryname: new FormControl(subcategoryThree.subcategoryname),
          weightage: new FormControl(subcategoryThree.weightage),
          parameter: this.prepareParameterControlView(subcategoryThree),
        })
      );
    });
    return subcategoryThreeControls;
  }

  private prepareParameterControlView(subcategoryThree: any) {
    let parameterControls: any = new FormArray([]);
    subcategoryThree.parameter.forEach((parameter: any) => {
      parameterControls.push(
        new FormGroup({
          nodeId: new FormControl(parameter.nodeId),
          badgeCount: new FormControl(parameter.badgeCount),
          parametername: new FormControl(parameter.parametername),
          weightage: new FormControl(parameter.weightage),
          maxschore: new FormControl(parameter.maxschore),
          schoringcriteria: this.prepareScoringCriteriaControlView(parameter),
        })
      );
    });
    return parameterControls;
  }

  private prepareScoringCriteriaControlView(parameter: any, isCopy?: boolean) {
    let scoringCriteriaControls: any = new FormArray([]);
    parameter.schoringcriteria.forEach((schoringcriteria: any) => {
      scoringCriteriaControls.push(
        new FormGroup({
          nodeId: new FormControl(schoringcriteria.nodeId),
          criteriaValue: new FormControl(schoringcriteria.criteriaValue),
          score: new FormControl(''),
        })
      );
    });
    return scoringCriteriaControls;
  }

  ngDestroy() {
    this.templateBuilderService.dialogFormDataObserver.complete();
  }
}
