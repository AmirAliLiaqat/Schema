function copyToClipboard(copy_text) {
  var $temp = $("<textarea></textarea>");
  $("body").append($temp);
  $temp.val(copy_text).select();
  document.execCommand("copy");
  $temp.remove();
}

function get_dropdown_values_list(current_main_li) {

  output = new Array();
  if(current_main_li.find(".add_schema_ul li").length >= 1){    
    var current_index = 0;
    current_main_li.find(".add_schema_ul li").each(function(){
      select_dropdown_value = $(this).find(".select_dropdown_value").val();
      select_dropdown_label = $(this).find(".select_dropdown_label").val();
      if(select_dropdown_label && select_dropdown_value){
        output.push({'name': select_dropdown_label, 'source':select_dropdown_value, 'value': current_index});
        current_index++;
      }      
    });
  }
  return output;
}

function inArray(needle, haystack) {
  var length = haystack.length;
  for(var i = 0; i < length; i++) {
      if(haystack[i] == needle) return true;
  }
  return false;
}

function get_dropdown_values_list_for_boolean(current_main_li) {

  output = new Array();
  if(current_main_li.find(".add_schema_ul li").length >= 1){    
    var current_index = 0;
    current_main_li.find(".add_schema_ul li").each(function(){
      select_dropdown_value = $(this).find(".select_dropdown_value").val();
      select_dropdown_label = $(this).find(".select_dropdown_label").val();
      if(select_dropdown_label && select_dropdown_value){
        output.push({'name': select_dropdown_label, 'value': select_dropdown_value});
        current_index++;
      }      
    });
  }
  return output;
}

function get_dropdown_values_list_for_bucket(current_main_li) {

  output = new Array();
  if(current_main_li.find(".add_schema_ul li").length >= 1){    
    var current_index = 0;
    current_main_li.find(".add_schema_ul li").each(function(){
      select_dropdown_value = $(this).find(".select_dropdown_value").val();
      select_dropdown_label = $(this).find(".select_dropdown_label").val();
      if(select_dropdown_label && select_dropdown_value){
        bucket = select_dropdown_value.split("-");
        output.push({'name': select_dropdown_label, 'bucket': bucket, 'value': current_index});
        current_index++;
      }      
    });
  }
  return output;
}

function setLocalStorage(key, value){
	if (typeof(Storage) !== "undefined") {
		localStorage.setItem(key, value);
	}
}
function getLocalStorage(key){
	if (typeof(Storage) !== "undefined")
		return localStorage.getItem(key);
  else
    return false;
}
function removeLocalStorage(key){
	if (typeof(Storage) !== "undefined")
	  localStorage.removeItem(key);
}


/***************************************************** */
/*****Import page***** */
/***************************************************** */

var schema_obj = {};

$(document).ready(function(){
  
  $("body").on("click", ".import_schema_button", function(e){
    schema_json = $(".schema_text").val();
    if(schema_json){
      setLocalStorage('schema', schema_json);      
    }else{
      $(".form-message").html('Please type correct schema.').show();
      e.stopPropagation();
      e.preventDefault();
      return false;
    }
    
  });
  
});

/***************************************************** */
/*****Import page end***** */
/***************************************************** */
var schema = {};
schema['type'] = 'record';
schema['name'] = 'SampleMetaData';
schema['dataSourceId'] = 'sample';
schema['dySchemaVersion'] = 1;
schema['display'] = 'CRM data';

var if_selected_data_type;

$(document).ready(function(){

  generate_ui_from_schema();

  $("body").on("click", ".copy_clipboard", function(e){
    copyToClipboard($(".schema_json pre").html());
    // copyToClipboard(create_schema());
    e.stopPropagation();
    e.preventDefault();
    return false;
  });

  $("body").on("click", ".add_schema_values", function(e){
    clone_html = $(".new_schema_values_li_html").html();
    $(this).closest(".double_container").find(".add_schema_ul").append(clone_html);
    // $(this).closest(".double_container").find(".add_schema_ul").append($(".add_schema_ul li:first").clone());
    e.stopPropagation();
    e.preventDefault();
    return false;
  });

  $("body").on("click", ".double_container_icon", function(e){

    if($(this).closest(".double_container").find(".add_schema_ul li").length >= 2){
      $(this).closest("li").remove();
    }else{
      $(this).closest("ul").closest("li").remove();
    }
    create_schema();
    // if($(this).closest(".double_container").find(".add_schema_ul li").length >= 2){
    //   $(this).closest("li").remove();
    // }
    e.stopPropagation();
    e.preventDefault();
    return false;
  });

  $("body").on("click", ".add_conditions_btn", function(e){
    clone_html = $(".new_condition_li_html").html();
    //$(".schema_box_conditions_containers li:first").clone()
    $(".schema_box_conditions_containers").append(clone_html);
    e.stopPropagation();
    e.preventDefault();
    return false;
  });

  $("body").on("change", "input[type='text']", function(){
    create_schema();
  });
  $("body").on("keyup", "input[type='text']", function(){
    create_schema();
  });

  $("body").on("change", ".condition_type", function(){
    // current_select_list = $(this);
    hide_add_possible_values($(this));    
    create_schema();
  });


  function hide_add_possible_values(current_select_list){
    current_value = current_select_list.val();
    if(current_value == 'dropdown' || current_value == 'boolean' || current_value == 'bucket'){
      current_select_list.closest("li").find(".add_schema_values").addClass('active');
      current_select_list.closest("li").find(".double_contaner_wrapper input[type='text']").removeAttr('disabled');
    }else{
      current_select_list.closest("li").find(".add_schema_values").removeClass('active');
      current_select_list.closest("li").find(".double_contaner_wrapper input[type='text']").val('').prop('disabled', true);
    }
  }
  

  function hide_add_possible_values_all(){
    $(".condition_type").each(function(i, item){
      hide_add_possible_values($(this));    
    });
  }
  
  function create_schema(){
    schema['fields'] = new Array();
    schema['uiTypes'] = {};
    if($(".schema_box_conditions_containers li").length >= 1){
      $(".schema_box_conditions_containers li").each(function(i){
        selected_condition_type = false;
        current_main_li = $(this);
        crm_column_name = current_main_li.find('.crm_column_name').val();
        condition_name_dynamic_yield = current_main_li.find('.condition_name_dynamic_yield').val();
        condition_type = current_main_li.find('.condition_type').val();

        if(crm_column_name && condition_type){

          if(!condition_name_dynamic_yield)
              condition_name_dynamic_yield = crm_column_name;

          data_type = 'int';
          ui_type = 'ref';
          uiTypeRef = false;

          if(condition_type == 'text'){
            data_type = 'string';
            ui_type = 'input';
          }
          else if(condition_type == 'int'){
            data_type = 'int';
            ui_type = 'number';
          }
          else if(condition_type == 'float'){
            data_type = 'double';
            ui_type = 'number';
          }
          else if(condition_type == 'date'){
            data_type = 'long';
            ui_type = 'date';
          }
          else if(condition_type == 'dropdown' || condition_type == 'boolean' || condition_type == 'bucket'){
            uiTypeRef = "UI"+crm_column_name;
            if(condition_type == 'boolean'){
              data_type = 'boolean';
              dropdown_values = get_dropdown_values_list_for_boolean(current_main_li);
            }
            else if(condition_type == 'bucket'){
              dropdown_values = get_dropdown_values_list_for_bucket(current_main_li);
            }
            else{
              dropdown_values = get_dropdown_values_list(current_main_li);
            }
            
            if(dropdown_values.length >= 1){
              // dropdown_values = new Array({'name':'female', 'value':0, "source":"female"}, {'name':'male', 'value':1, "source":"male"});
              schema['uiTypes'][uiTypeRef] = {};
              schema['uiTypes'][uiTypeRef]['uiType'] = 'select';
              schema['uiTypes'][uiTypeRef]['validation'] = {};
              schema['uiTypes'][uiTypeRef]['validation']['values'] = dropdown_values;
            }
          }
          
          if(uiTypeRef){
            schema['fields'].push({'name': crm_column_name, 'display': condition_name_dynamic_yield, 'type':['null', data_type], 'uiType': ui_type, 'uiTypeRef':uiTypeRef});
          }
          else
            schema['fields'].push({'name': crm_column_name, 'display': condition_name_dynamic_yield, 'type':['null', data_type], 'uiType': ui_type});
        }

      });
      
    }
    
    
    $(".schema_json pre").html(JSON.stringify(schema, null, 2));
    return JSON.stringify(schema);
  }

  function generate_ui_from_schema(){
    stored_schema = getLocalStorage('schema');
    if(stored_schema){
      removeLocalStorage('schema');      
      schema_obj = JSON.parse(stored_schema);
      if(typeof schema_obj == 'object' && typeof schema_obj.fields == 'object' && schema_obj.fields.length >= 1){
        $(".schema_box_conditions_containers").html('');

        $.each(schema_obj.fields, function(index, item){          
          if(typeof item == 'object' && typeof item.name != 'undefined' && typeof item.display != 'undefined'){            
            li_html = '<li>';
            
            li_html += '<div class="li_container"><input type="text" name="" id="" class="crm_column_name form-control" value="'+item.name+'"></div>';
            li_html += '<div class="li_container"><input type="text" name="" id="" class="form-control condition_name_dynamic_yield" value="'+item.display+'"></div>';
            li_html += selected_data_type(item);

            li_html += dropdown_list_values_html(item, schema_obj);

            li_html += '<div class="clearboth"></div>';
            li_html += '</li>';
            $(".schema_box_conditions_containers").append(li_html);
          }
        });

        create_schema();
        hide_add_possible_values_all();
      }
    }
  }

  function selected_data_type(item){
    if_selected_data_type = false;
    li_html = '';
    
    li_html += '<div class="li_container">'; 
    li_html += '<select name="" id="" class="form-control condition_type">';    
    
    li_html += '<option value="dropdown" '+if_selected(item, 'ref', 'dropdown')+'>Dropdown</option>';
    li_html += '<option value="text" '+if_selected(item, 'input', 'string')+'>Text</option>';
    li_html += '<option value="int" '+if_selected(item, 'number', new Array('int', 'long'))+'>Number (without a decimal point)</option>';
    li_html += '<option value="float" '+if_selected(item, 'number', 'double')+'>Number (with a decimal point)</option>';
    li_html += '<option value="boolean" '+if_selected(item, 'ref', 'boolean')+'>True/false</option>';
    li_html += '<option value="date" '+if_selected(item, 'date', 'long')+'>Date</option>';
    li_html += '<option value="bucket" '+if_selected(item, 'ref', 'bucket')+'>Bucket</option>';

    li_html += '</select>'; 
    li_html += '</div>';

    // data_type = 'int';
    // ui_type = 'ref';
    // uiTypeRef = false;
    
    
    return li_html;
  }

  function if_selected(item, ui_type, data_type = false){
    
    output = '';
    if(typeof item.uiType != 'undefined' && typeof item.type != 'undefined' && item.type.length >= 2 && typeof item.type[1] != 'undefined' && item.uiType == ui_type && if_selected_data_type == false){
      // console.log(Array.isArray(data_type));
      if(data_type != false && Array.isArray(data_type) && inArray(item.type[1], data_type)/*data_type == item.type[1]*/){
        if_selected_data_type = true;
        output = 'selected="selected" ';
      }
      else if(data_type != false && data_type == item.type[1]){
        if_selected_data_type = true;
        output = 'selected="selected" ';
      }
      else if(
        ui_type == 'ref' && 
        typeof item.uiTypeRef != 'undefined' && 
        typeof schema_obj != 'undefined' && 
        typeof schema_obj.uiTypes != 'undefined' && 
        typeof schema_obj.uiTypes[item.uiTypeRef] != 'undefined' && 
        typeof schema_obj.uiTypes[item.uiTypeRef]['validation'] != 'undefined' && 
        typeof schema_obj.uiTypes[item.uiTypeRef]['validation']['values'] != 'undefined' && 
        schema_obj.uiTypes[item.uiTypeRef]['validation']['values'].length >= 1
        )
      {
        
        if(typeof schema_obj.uiTypes[item.uiTypeRef]['validation']['values'][0]['bucket'] != 'undefined' && data_type == 'bucket'){
          if_selected_data_type = true;
          output = 'selected="selected" ';
        }else if(typeof schema_obj.uiTypes[item.uiTypeRef]['validation']['values'][0]['source'] != 'undefined' && data_type == 'dropdown'){
          if_selected_data_type = true;
          output = 'selected="selected" ';
        }
      }

    }


    /*if(typeof item.uiType != 'undefined' && item.uiType == ui_type && if_selected_data_type == false){
      if(data_type != false && typeof item.type != 'undefined' && item.type.length >= 2){
        if(item.type[1] == data_type){
          if_selected_data_type = true;
          output = 'selected="selected" ';
        }else{
          output = '';
        }
      }else{
        if_selected_data_type = true;
        output =  'selected="selected" ';
      }      
    }*/
    return output;
  }


  function dropdown_list_values_html(item, schema_obj){
    li_html = '';

    li_html += '<div class="double_container">';
    li_html += '<ul class="m-0 p-0 add_schema_ul">';

    // stored_schema = getLocalStorage('schema');
    // var schema_obj = JSON.parse(stored_schema);
    new_li_html = false;
    if(
      typeof schema_obj != 'undefined' &&
      typeof item.uiType != 'undefined' && 
      typeof item.uiTypeRef != 'undefined' && 
      item.uiType == 'ref' && 
      typeof schema_obj.uiTypes != 'undefined' && 
      typeof schema_obj.uiTypes[item.uiTypeRef] != 'undefined' && 
      typeof schema_obj.uiTypes[item.uiTypeRef]['validation'] != 'undefined' && 
      typeof schema_obj.uiTypes[item.uiTypeRef]['validation']['values'] != 'undefined' && 
      schema_obj.uiTypes[item.uiTypeRef]['validation']['values'].length >= 1 
      ){
        $.each(schema_obj.uiTypes[item.uiTypeRef]['validation']['values'], function(i, loop_item){
          if(typeof loop_item.name != 'undefined' && typeof loop_item.source != 'undefined' && typeof loop_item.value != 'undefined' && loop_item.name && loop_item.source){
            new_li_html = true;
            li_html += dropdown_list_values_in_input(loop_item.source, loop_item.name);
          }
          else if(typeof loop_item.name != 'undefined' && typeof loop_item.value != 'undefined' && typeof loop_item.bucket != 'undefined' && loop_item.name && loop_item.bucket.length >= 1){
            new_li_html = true;
            li_html += dropdown_list_values_in_input(loop_item.bucket.join('-'), loop_item.name);
          }else if(typeof loop_item.name != 'undefined' && typeof loop_item.value != 'undefined' && loop_item.name && loop_item.value){
            new_li_html = true;
            li_html += dropdown_list_values_in_input(loop_item.value, loop_item.name);
          }
        });
    }
    
    if(new_li_html == false){
      li_html += dropdown_list_values_in_input();
    }
    
    li_html += '</ul>';
    li_html += '<p class="add_schema_values_btn_container" style="margin-left:2.6%;"><a href="#" class="add_schema_values active">+ Add Possible Values</a></p>';
    li_html += '</div><!-- double_container -->';
    return li_html;

  }

  function dropdown_list_values_in_input(dropdown_value = '', dropdown_label = ''){
    li_html = '';
    li_html += '<li>';
    li_html += '<div class="double_contaner_wrapper">';
    li_html += '<div class="li_double_contaner"><input type="text" name="" id="" class="select_dropdown_value form-control" value="'+dropdown_value+'"></div>';
    li_html += '<div class="li_double_contaner"><input type="text" name="" id="" class="select_dropdown_label form-control" value="'+dropdown_label+'"></div>';
    li_html += '<div class="li_double_contaner double_container_icon"><img src="images/delete.png" alt=""></div>';
    li_html += '<div class="clearboth"></div>';
    li_html += '</div><!-- double_contaner_wrapper-->';
    li_html += '</li>';
    return li_html;
  }
});

// jQuery(document).ready(function($){
//   $("img").each(function(){
//     $(this).attr("data-no-lazy", '0');
//   });
// });

/************** Code for copy data *************/
$(document).ready(function() {
  $('body').on("click", ".copy_clipboard", function() {
    $('.tooltip-inner').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;copied&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
  });
});

$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});