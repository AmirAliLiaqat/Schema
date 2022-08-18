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

var schema = {};
schema['type'] = 'record';
schema['name'] = 'SampleMetaData';
schema['dataSourceId'] = 'sample';
schema['dySchemaVersion'] = 1;
schema['display'] = 'CRM data';

$(document).ready(function(){

  $("body").on("click", ".copy_clipboard", function(e){
    copyToClipboard(create_schema());
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
    current_select_list = $(this);
    
    if(current_select_list.val() == 'dropdown'){
      $(this).closest("li").find(".add_schema_values").addClass('active');
    }else{
      $(this).closest("li").find(".add_schema_values").removeClass('active');
    }
    create_schema();
  });

  
  
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
            dropdown_values = get_dropdown_values_list(current_main_li);
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
    
    
    $(".schema_json pre").html(JSON.stringify(schema, null, "\t"));
    return JSON.stringify(schema);
  }

});