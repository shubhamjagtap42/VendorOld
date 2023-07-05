import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { OverlayPanel } from 'primeng/overlaypanel';
import { CombineCategoryDialogComponent } from '../newtemplate/template-demo/combine-category-dialog/combine-category-dialog.component';
import { EditOperationDialogComponent } from '../newtemplate/template-demo/edit-operation-dialog/edit-operation-dialog.component';
import { SearchOperationDialogComponent } from '../newtemplate/template-demo/search-operation-dialog/search-operation-dialog.component';
import { TemplateService } from '../template.service';
import {
  ProductDEMO,
  Category,
} from '../newtemplate/template-demo/product-interface';
import { TemplatebuilderService } from '../newtemplate/templatebuilder.service';
import { AppModuleConstants } from 'src/app/app-constants';
import { VendorMngServiceService } from 'src/app/vendor-mng-service.service';
import { LoadingSpinnerService } from 'src/app/services/loading-spinner.service';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-view-template',
  templateUrl: './view-template.component.html',
  styleUrls: ['./view-template.component.css'],
  providers: [ConfirmationService, MessageService],
})
export class ViewTemplateComponent implements OnInit {
  templateForm!: FormGroup;
  commentForm!: FormGroup;

  @ViewChild('addCommetOverlay', { static: false })
  addCommetOverlay!: OverlayPanel;
  @ViewChild('viewCommentOverlay', { static: false })
  viewCommentOverlay!: OverlayPanel;
  @ViewChild('commentInput') commentInput!: ElementRef;

  categoriesData: any = [];
  productsData!: ProductDEMO[];
  categories!: Category[];
  public rowsCollapsed: boolean[] = [];

  selectedTemplateData: any;
  loadView: boolean = false;
  userRole!: any;
  userName: any;
  access: any = [];
  collapsed1: any;
  disableField: boolean = false;
  commentData: any = [];
  viewComment: boolean = false;
  issueType!: string;

  isLoading: boolean = false;
  activeState: boolean[] = [true, false, false];

  constructor(
    private location: Location,
    private templateService: TemplateService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    public templateBuilderService: TemplatebuilderService,
    private vendorService: VendorMngServiceService,
    private spinner: LoadingSpinnerService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.spinner.isLoading.subscribe((val) => {
      this.isLoading = val;
    });

    this.spinner.isLoading.next(true);

    this.userRole = sessionStorage.getItem(AppModuleConstants.ROLE)!;
    this.userName = sessionStorage.getItem(AppModuleConstants.USER);
    this.disableField = this.userRole == 2 ? false : true;

    this.access['optionButton'] = {
      view: true,
    };

    this.templateService.getCategoriesData().subscribe((categgoryData: any) => {
      this.categoriesData =
        this.templateService.transformCategoryData(categgoryData);

      this.categoriesData =
        this.templateService.transformCategoryData(categgoryData);
      console.log('this.categoriesData: ', this.categoriesData);

      for (let i = 0; i < this.categoriesData.length; i++) {
        this.categoriesData[i].states = this.categoriesData[i].states.sort(
          (a: any, b: any) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
          }
        );
      }

      console.log(this.activatedRoute.snapshot.params['templateId']);
      // this.templateService.getSelectedTemplateData(this.activatedRoute.snapshot.params['templateId']).subscribe((data: any) => {

      this.selectedTemplateData = this.vendorService.templateDetails[0];
      console.log('this.selectedTemplateData: ', this.selectedTemplateData);
      this.populateData(this.selectedTemplateData.templateData);
      this.loadView = true;
      this.getCategoryControls().valueChanges.subscribe(console.log);
      this.subscribeOperation();
      this.pullNodeCommentCount();
      this.spinner.isLoading.next(false);

      // });
    });
  }

  toggleVisibility(id: any) {
    console.log(id);

    let element: any = document.getElementById(id);
    if (element.style.display === 'none') {
      element.style.display = 'table-row';
    } else {
      element.style.display = 'none';
    }
  }

  private pullNodeCommentCount() {
    this.templateService
      .getNodeCommentsAll(this.activatedRoute.snapshot.params['templateId'])
      .subscribe((commentData: any) => {
        console.log('commentData: ', commentData);
        this.populateComments(commentData);
      });
  }

  private populateComments(commentData: any) {
    this.getCategoryControls().value.forEach(
      (category: any, categoryIndex: number) => {
        let mappedData = this.templateService.filterCommentData(
          category.nodeId,
          commentData
        );
        if (mappedData) {
          this.getCategoryControls()
            ?.at(categoryIndex)
            .get('badgeCount')
            ?.patchValue(mappedData.commentCount);
        }
        category.subcategory.forEach(
          (subCategory: any, subCategoryIndex: number) => {
            let mappedData = this.templateService.filterCommentData(
              subCategory.nodeId,
              commentData
            );
            if (mappedData) {
              this.getSubCategoryControls(categoryIndex)
                ?.at(subCategoryIndex)
                .get('badgeCount')
                ?.patchValue(mappedData.commentCount);
            }
            subCategory.subcategoryTwo.forEach(
              (subCategoryTwo: any, subCategoryTwoIndex: number) => {
                let mappedData = this.templateService.filterCommentData(
                  subCategoryTwo.nodeId,
                  commentData
                );
                if (mappedData) {
                  this.getSubCategoryTwoControls(
                    categoryIndex,
                    subCategoryIndex
                  )
                    ?.at(subCategoryTwoIndex)
                    .get('badgeCount')
                    ?.patchValue(mappedData.commentCount);
                }

                subCategoryTwo.subcategoryThree.forEach(
                  (subcategoryThree: any, subCategoryThreeIndex: number) => {
                    let mappedData = this.templateService.filterCommentData(
                      subcategoryThree.nodeId,
                      commentData
                    );
                    if (mappedData) {
                      this.getSubCategoryThreeControls(
                        categoryIndex,
                        subCategoryIndex,
                        subCategoryTwoIndex
                      )
                        ?.at(subCategoryThreeIndex)
                        .get('badgeCount')
                        ?.patchValue(mappedData.commentCount);
                    }

                    subcategoryThree.parameter.forEach(
                      (parameter: any, parameterIndex: number) => {
                        let mappedData = this.templateService.filterCommentData(
                          parameter.nodeId,
                          commentData
                        );
                        if (mappedData) {
                          this.getParameterControls(
                            categoryIndex,
                            subCategoryIndex,
                            subCategoryTwoIndex,
                            subCategoryThreeIndex
                          )
                            ?.at(parameterIndex)
                            .get('badgeCount')
                            ?.patchValue(mappedData.commentCount);
                        }
                        parameter.schoringcriteria.forEach(
                          (
                            schoringcriteria: any,
                            schoringcriteriaIndex: number
                          ) => {
                            let mappedData =
                              this.templateService.filterCommentData(
                                schoringcriteria.nodeId,
                                commentData
                              );
                            if (mappedData) {
                              this.getScoringCriteriaControls(
                                categoryIndex,
                                subCategoryIndex,
                                subCategoryTwoIndex,
                                subCategoryThreeIndex,
                                parameterIndex
                              )
                                ?.at(schoringcriteriaIndex)
                                .get('badgeCount')
                                ?.patchValue(mappedData.commentCount);
                            }
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  }

  addCategory(): void {
    let rowCount: any = prompt('How many categories you want to create ?');

    const calculateWeightage = Math.floor(
      100 / ((this.templateForm.get('category') as FormArray).length + rowCount)
    );
    console.log(calculateWeightage);
    let i = 0;
    while (i < rowCount) {
      (this.templateForm.get('category') as FormArray).push(
        new FormGroup({
          nodeId: new FormControl(this.templateService.getRandomNodeId()),
          badgeCount: new FormControl(0),
          name: new FormControl(''),
          weightage: new FormControl([calculateWeightage]),
          subcategory: new FormArray([
            new FormGroup({
              nodeId: new FormControl(this.templateService.getRandomNodeId()),
              badgeCount: new FormControl(0),
              subcategoryname: new FormControl(''),
              weightage: new FormControl('100.00'),
              subcategoryTwo: new FormArray([
                new FormGroup({
                  nodeId: new FormControl(
                    this.templateService.getRandomNodeId()
                  ),
                  badgeCount: new FormControl(0),
                  subcategoryname: new FormControl(''),
                  weightage: new FormControl('100.00'),
                  subcategoryThree: new FormArray([
                    new FormGroup({
                      nodeId: new FormControl(
                        this.templateService.getRandomNodeId()
                      ),
                      badgeCount: new FormControl(0),
                      subcategoryname: new FormControl(''),
                      weightage: new FormControl('100.00'),
                      parameter: new FormArray([
                        new FormGroup({
                          nodeId: new FormControl(
                            this.templateService.getRandomNodeId()
                          ),
                          badgeCount: new FormControl(0),
                          parametername: new FormControl(''),
                          weightage: new FormControl('100.00'),
                          maxschore: new FormControl(''),
                          schoringcriteria: new FormArray([
                            new FormGroup({
                              nodeId: new FormControl(
                                this.templateService.getRandomNodeId()
                              ),
                              badgeCount: new FormControl(0),
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

    this.calculateWeightage(this.templateForm.get('category') as FormArray);
  }

  // isCollapsed:boolean=false;
  // toggleRow(i: any) {
  //   console.log(i,"id========");

  //   this.isCollapsed = !this.isCollapsed;
  //   // console.log(this.calculateWeightage);

  // }

  addSingleCategory(): void {
    let rowCount: any = 1;

    const calculateWeightage = Math.floor(
      100 / ((this.templateForm.get('category') as FormArray).length + rowCount)
    );
    console.log(calculateWeightage);
    let i = 0;
    while (i < rowCount) {
      (this.templateForm.get('category') as FormArray).push(
        new FormGroup({
          nodeId: new FormControl(this.templateService.getRandomNodeId()),
          badgeCount: new FormControl(0),
          name: new FormControl(''),
          weightage: new FormControl([calculateWeightage]),
          subcategory: new FormArray([
            new FormGroup({
              nodeId: new FormControl(this.templateService.getRandomNodeId()),
              badgeCount: new FormControl(0),
              subcategoryname: new FormControl(''),
              weightage: new FormControl('100.00'),
              subcategoryTwo: new FormArray([
                new FormGroup({
                  nodeId: new FormControl(
                    this.templateService.getRandomNodeId()
                  ),
                  badgeCount: new FormControl(0),
                  subcategoryname: new FormControl(''),
                  weightage: new FormControl('100.00'),
                  subcategoryThree: new FormArray([
                    new FormGroup({
                      nodeId: new FormControl(
                        this.templateService.getRandomNodeId()
                      ),
                      badgeCount: new FormControl(0),
                      subcategoryname: new FormControl(''),
                      weightage: new FormControl('100.00'),
                      parameter: new FormArray([
                        new FormGroup({
                          nodeId: new FormControl(
                            this.templateService.getRandomNodeId()
                          ),
                          badgeCount: new FormControl(0),
                          parametername: new FormControl(''),
                          weightage: new FormControl('100.00'),
                          maxschore: new FormControl(''),
                          schoringcriteria: new FormArray([
                            new FormGroup({
                              nodeId: new FormControl(
                                this.templateService.getRandomNodeId()
                              ),
                              badgeCount: new FormControl(0),
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

    this.calculateWeightage(this.templateForm.get('category') as FormArray);
  }

  removeCategory(index: number): void {
    (this.templateForm.get('category') as FormArray).removeAt(index);
    this.calculateWeightage(this.templateForm.get('category') as FormArray);
  }

  getProductsData(): void {
    this.templateBuilderService.getProduct().subscribe((response: any) => {
      this.productsData = response;
      this.categories = this.productsData[0].category;
    });
  }

  private subscribeOperation() {
    this.templateBuilderService.dialogFormDataSubscriber$.subscribe(
      (data: any) => {
        console.log('subscription data: ', data);

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
        }
      }
    );
  }

  getCategoryControls(): FormArray {
    return this.templateForm.get('category') as FormArray;
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

  populateData(data: any) {
    let controls: any = new FormArray([]);
    data.forEach((categoryControl: any, index: number) => {
      controls.push(
        new FormGroup({
          badgeCount: new FormControl(0),
          nodeId: new FormControl({
            value: categoryControl.nodeId,
            disabled: this.disableField,
          }),
          name: new FormControl({
            value: categoryControl.name,
            disabled: this.disableField,
          }),
          weightage: new FormControl({
            value: categoryControl.weightage,
            disabled: this.disableField,
          }),
          subcategory: this.prepareSubCategoryControl(categoryControl),
        })
      );
    });

    this.templateForm = new FormGroup({ category: controls });
    console.log(this.templateForm);
  }

  private prepareSubCategoryControl(category: any, isCopy?: boolean) {
    let categoryControls: any = new FormArray([]);
    category.subcategory.forEach((subcategory: any) => {
      categoryControls.push(
        new FormGroup({
          badgeCount: new FormControl(0),
          nodeId: new FormControl({
            value: isCopy
              ? this.templateService.getRandomNodeId()
              : subcategory.nodeId,
            disabled: this.disableField,
          }),
          subcategoryname: new FormControl({
            value: subcategory.subcategoryname,
            disabled: this.disableField,
          }),
          weightage: new FormControl({
            value: subcategory.weightage,
            disabled: this.disableField,
          }),
          subcategoryTwo: this.prepareSubCategoryTwoControl(
            subcategory,
            '',
            isCopy
          ),
        })
      );
    });
    return categoryControls;
  }

  private prepareSubCategoryTwoControl(
    subcategory: any,
    data?: any,
    isCopy?: boolean
  ) {
    let subcategoryTwoControls: any = new FormArray([]);
    subcategory.subcategoryTwo.forEach((subcategoryTwo: any) => {
      subcategoryTwoControls.push(
        new FormGroup({
          badgeCount: new FormControl(0),
          nodeId: new FormControl({
            value: isCopy
              ? this.templateService.getRandomNodeId()
              : subcategoryTwo.nodeId,
            disabled: this.disableField,
          }),
          subcategoryname: new FormControl({
            value: subcategoryTwo.subcategoryname,
            disabled: this.disableField,
          }),
          weightage: new FormControl({
            value: subcategoryTwo.weightage,
            disabled: this.disableField,
          }),
          subcategoryThree: this.prepareSubCategoryThreeControl(
            subcategoryTwo,
            '',
            isCopy
          ),
        })
      );
    });
    return subcategoryTwoControls;
  }

  private prepareSubCategoryThreeControl(
    subcategoryTwo: any,
    data?: any,
    isCopy?: boolean
  ) {
    let subcategoryThreeControls: any = new FormArray([]);
    subcategoryTwo.subcategoryThree.forEach((subcategoryThree: any) => {
      console.log(
        'subcategoryThree.subcategoryname: ',
        subcategoryThree.subcategoryname
      );
      subcategoryThreeControls.push(
        new FormGroup({
          badgeCount: new FormControl(0),
          nodeId: new FormControl({
            value: isCopy
              ? this.templateService.getRandomNodeId()
              : subcategoryThree.nodeId,
            disabled: this.disableField,
          }),
          subcategoryname: new FormControl({
            value: subcategoryThree.subcategoryname,
            disabled: this.disableField,
          }),
          weightage: new FormControl({
            value: subcategoryThree.weightage,
            disabled: this.disableField,
          }),
          parameter: this.prepareParameterControl(subcategoryThree, '', isCopy),
        })
      );
    });
    return subcategoryThreeControls;
  }

  private prepareParameterControl(
    subcategoryThree: any,
    data?: any,
    isCopy?: boolean
  ) {
    let parameterControls: any = new FormArray([]);
    subcategoryThree.parameter.forEach((parameter: any) => {
      parameterControls.push(
        new FormGroup({
          badgeCount: new FormControl(0),
          nodeId: new FormControl({
            value: isCopy
              ? this.templateService.getRandomNodeId()
              : parameter.nodeId,
            disabled: this.disableField,
          }),
          parametername: new FormControl({
            value: parameter.parametername,
            disabled: this.disableField,
          }),
          weightage: new FormControl({
            value: parameter.weightage,
            disabled: this.disableField,
          }),
          maxschore: new FormControl({
            value: parameter.maxschore,
            disabled: this.disableField,
          }),
          schoringcriteria: this.prepareScoringCriteriaControl(
            parameter,
            isCopy
          ),
        })
      );
    });
    return parameterControls;
  }

  private prepareScoringCriteriaControl(parameter: any, isCopy?: boolean) {
    let scoringCriteriaControls: any = new FormArray([]);
    parameter.schoringcriteria.forEach((schoringcriteria: any) => {
      scoringCriteriaControls.push(
        new FormGroup({
          badgeCount: new FormControl(0),
          nodeId: new FormControl({
            value: isCopy
              ? this.templateService.getRandomNodeId()
              : schoringcriteria.nodeId,
            disabled: this.disableField,
          }),
          criteriaValue: new FormControl({
            value: schoringcriteria.criteriaValue,
            disabled: this.disableField,
          }),
          score: new FormControl(''),
        })
      );
    });
    return scoringCriteriaControls;
  }

  onClickBack() {
    this.location.back();
  }

  openViewCommentOverlay(event: Event, nodeId: string, type?: string) {
    console.log('nodeId: ', nodeId);
    this.issueType = type!;
    this.viewCommentOverlay.toggle(event);

    this.viewComment = false;
    this.commentForm = new FormGroup({
      comment: new FormControl('', Validators.required),
      nodeId: new FormControl(nodeId),
    });

    if (this.issueType == 'new') {
      this.viewComment = true;
      this.commentData = {
        userId: this.userName,
        comments: [],
      };
      setTimeout(() => {
        this.commentInput.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }, 10);
    } else {
      this.getComments(nodeId);
    }
  }

  private getComments(nodeId: string) {
    this.templateService.getNodeComments(nodeId).subscribe((res: any) => {
      console.log('this.commentData: ', this.commentData);
      this.viewComment = true;
      this.commentData = res;
      setTimeout(() => {
        this.commentInput.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }, 10);
    });
  }

  getCommentClass(commentByUser: string) {
    if (this.userName.toLowerCase() == commentByUser.toLowerCase()) {
      return 'my-reply';
    } else {
      return 'received-reply';
    }
  }

  postComment(event?: KeyboardEvent, inputEvent: boolean = false) {
    console.log('event: ', event, ' inputEvent: ', inputEvent);
    if (this.commentForm.get('comment')?.value) {
      if (inputEvent) {
        if (event?.keyCode == 13) {
          this.sendCommentMessage();
        }
      } else {
        this.sendCommentMessage();
      }
    }
  }

  private sendCommentMessage() {
    let data: any = {
      nodeId: this.commentForm.get('nodeId')?.value,
      caseStatus: 'Pending',
      issueDate: 0,
      userId: this.commentData.userId,
      templateId: this.activatedRoute.snapshot.params['templateId'],
      comments: [
        {
          commentText: this.commentForm.get('comment')?.value,
          readStatus: true,
          commentDate: 0,
          userId: this.userName,
        },
      ],
    };

    this.commentForm.patchValue({ comment: '' });
    this.commentData.comments.push(data.comments[0]);
    setTimeout(() => {
      this.commentInput.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 10);

    if (this.issueType == 'new') {
      this.templateService
        .postNodeComment(this.commentForm.get('nodeId')?.value, data)
        .subscribe((res: any) => {
          this.populateComments([
            {
              caseStatus: 'Pending',
              commentCount: this.commentData.comments.length,
              nodeId: this.commentForm.get('nodeId')?.value,
            },
          ]);
        });
    } else {
      this.templateService
        .putNodeComment(this.commentForm.get('nodeId')?.value, data)
        .subscribe((res: any) => {
          this.populateComments([
            {
              caseStatus: 'Pending',
              commentCount: this.commentData.comments.length,
              nodeId: this.commentForm.get('nodeId')?.value,
            },
          ]);
        });
    }
  }

  onMarkResolved() {
    let data = {
      nodeId: this.commentForm.get('nodeId')?.value,
      caseStatus: 'Resolved',
      issueDate: 0,
      userId: this.commentData.userId,
      templateId: this.activatedRoute.snapshot.params['templateId'],
      comments: this.commentData.comments,
    };

    this.templateService
      .putNodeStatus(this.commentForm.get('nodeId')?.value, data)
      .subscribe((res: any) => {
        this.getComments(this.commentForm.get('nodeId')?.value);
      });
  }

  getUserCommentBadge(userName: string) {
    return userName.substring(0, 1).toUpperCase();
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

  openDialog(data: any) {
    this.dialog.open(CombineCategoryDialogComponent, {
      data: {
        input: data,
      },
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
            console.log('subCategory: ', subCategory);
            temp.push({ name: subCategory.subcategoryname });
          }
        } else {
          subCategory.subcategoryTwo.forEach((subCategoryTwo: any) => {
            if (operation == 'subCategoryTwo') {
              if (subCategoryTwo.subcategoryname != value) {
                console.log('subCategoryTwo: ', subCategoryTwo);
                temp.push({ name: subCategoryTwo.subcategoryname });
              }
            } else {
              subCategoryTwo.subcategoryThree.forEach(
                (subCategoryThree: any) => {
                  if (operation == 'subCategoryThree') {
                    if (subCategoryThree.subcategoryname != value) {
                      console.log('subCategoryThree: ', subCategoryThree);
                      temp.push({ name: subCategoryThree.subcategoryname });
                    }
                  } else {
                    subCategoryThree.parameter.forEach((parameter: any) => {
                      if (operation == 'parameter') {
                        if (parameter.parametername != value) {
                          console.log('parameter: ', parameter);
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
              badgeCount: new FormControl(0),
              nodeId: new FormControl(this.templateService.getRandomNodeId()),
              subcategoryname: new FormControl(''),
              weightage: new FormControl('100.00'),
              subcategoryThree: new FormArray([
                new FormGroup({
                  badgeCount: new FormControl(0),
                  nodeId: new FormControl(
                    this.templateService.getRandomNodeId()
                  ),
                  subcategoryname: new FormControl(''),
                  weightage: new FormControl('100.00'),
                  parameter: new FormArray([
                    new FormGroup({
                      badgeCount: new FormControl(0),
                      nodeId: new FormControl(
                        this.templateService.getRandomNodeId()
                      ),
                      parametername: new FormControl(''),
                      weightage: new FormControl('100.00'),
                      maxschore: new FormControl(''),
                      schoringcriteria: new FormArray([
                        new FormGroup({
                          badgeCount: new FormControl(0),
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
          badgeCount: new FormControl(0),
          nodeId: new FormControl(this.templateService.getRandomNodeId()),
          subcategoryname: new FormControl(),
          weightage: new FormControl('100.00'),
          subcategoryThree: new FormArray([
            new FormGroup({
              badgeCount: new FormControl(0),
              nodeId: new FormControl(this.templateService.getRandomNodeId()),
              subcategoryname: new FormControl(''),
              weightage: new FormControl('100.00'),
              parameter: new FormArray([
                new FormGroup({
                  badgeCount: new FormControl(0),
                  nodeId: new FormControl(
                    this.templateService.getRandomNodeId()
                  ),
                  parametername: new FormControl(''),
                  weightage: new FormControl('100.00'),
                  maxschore: new FormControl(''),
                  schoringcriteria: new FormArray([
                    new FormGroup({
                      badgeCount: new FormControl(0),
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
          badgeCount: new FormControl(0),
          nodeId: new FormControl(this.templateService.getRandomNodeId()),
          subcategoryname: new FormControl(),
          weightage: new FormControl('100.00'),
          parameter: new FormArray([
            new FormGroup({
              badgeCount: new FormControl(0),
              nodeId: new FormControl(this.templateService.getRandomNodeId()),
              parametername: new FormControl(''),
              weightage: new FormControl('100.00'),
              maxschore: new FormControl(''),
              schoringcriteria: new FormArray([
                new FormGroup({
                  badgeCount: new FormControl(0),
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
          badgeCount: new FormControl(0),
          nodeId: new FormControl(this.templateService.getRandomNodeId()),
          parametername: new FormControl(),
          weightage: new FormControl('100.00'),
          maxschore: new FormControl(''),
          schoringcriteria: new FormArray([
            new FormGroup({
              badgeCount: new FormControl(0),
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
          badgeCount: new FormControl(0),
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
    console.log('combine into index: ', data.categoryIndex);
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
    console.log('combine into index: ', data.categoryIndex);
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
    console.log('combine into index: ', data.categoryIndex);
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
    console.log('combine into index: ', data.categoryIndex);
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

    (this.templateForm.get('category') as FormArray).push(
      new FormGroup({
        badgeCount: new FormControl(0),
        nodeId: new FormControl(this.templateService.getRandomNodeId()),
        name: new FormControl(categoryControl.name),
        weightage: new FormControl(categoryControl.weightage),
        subcategory: this.prepareSubCategoryControl(categoryControl, true),
      })
    );

    this.calculateWeightage(this.getCategoryControls());
  }

  private subscribeEditOperation(data: any) {
    console.log('Edit subscription data: ', data);
    this.patchValue(data);
    this.dialog.closeAll();
  }

  private subscribeSearchOperation(data: any) {
    console.log('Search subscription data: ', data);
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

  onClickSave() {
    let data = {
      templateData: JSON.stringify(this.templateForm.value['category']),
      templateDescription: this.selectedTemplateData.templateDescription,
      project: this.selectedTemplateData.project,
      status: this.selectedTemplateData.status,
    };
    console.log(JSON.stringify(this.templateForm.value['category']));
    this.templateService
      .updateTemplateData(
        this.activatedRoute.snapshot.params['templateId'],
        data
      )
      .subscribe((result: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successfull',
          detail: 'Template updated successfully',
        });

        setTimeout(() => {
          this.router.navigate(['/BusinessUser/template-list']);
        }, 1300);
      },
      (error:HttpErrorResponse)=>{
        this.messageService.add({
          severity: 'error',
          summary: 'Error..!!',
          detail: 'Error while updating template..!!',
        });
      });
  }

  onClickCancel() {
    this.router.navigate(['/BusinessUser/template-list']);
  }
}
