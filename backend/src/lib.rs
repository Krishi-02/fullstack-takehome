extern crate proc_macro;
use proc_macro::TokenStream;
use quote::quote;
use syn::{Data, DeriveInput, Fields, parse_macro_input};

#[proc_macro_derive(FilterBuilder)]
pub fn filter_builder_derive(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let struct_name = &input.ident;

    let fields = match &input.data {
        Data::Struct(data_struct) => match &data_struct.fields {
            Fields::Named(fields_named) => &fields_named.named,
            _ => panic!("FilterBuilder only works on structs with named fields"),
        },
        _ => panic!("FilterBuilder only works on structs"),
    };

    let field_conditions = fields.iter().map(|field| {
        let field_name = &field.ident;
        let field_name_str = field_name.as_ref().unwrap().to_string();
        let field_type = &field.ty;

        let inner_type_str = quote!(#field_type).to_string();
        
        if inner_type_str.contains("IntFilter") {
            quote! {
                if let Some(ref filter) = self.#field_name {
                    if let Some(value) = filter.equals {
                        conditions.push(format!("{} = {}", #field_name_str, value));
                    }
                    if let Some(value) = filter.gt {
                        conditions.push(format!("{} > {}", #field_name_str, value));
                    }
                    if let Some(value) = filter.lt {
                        conditions.push(format!("{} < {}", #field_name_str, value));
                    }
                    if let Some(value) = filter.gte {
                        conditions.push(format!("{} >= {}", #field_name_str, value));
                    }
                    if let Some(value) = filter.lte {
                        conditions.push(format!("{} <= {}", #field_name_str, value));
                    }
                }
            }
        } else if inner_type_str.contains("StringFilter") {
            quote! {
                if let Some(ref filter) = self.#field_name {
                    if let Some(ref value) = filter.equals {
                        conditions.push(format!("LOWER({}) = LOWER('{}')", #field_name_str, value));
                    }
                    if let Some(ref value) = filter.contains {
                        conditions.push(format!("LOWER({}) LIKE LOWER('%{}%')", #field_name_str, value));
                    }
                    if let Some(ref value) = filter.starts_with {
                        conditions.push(format!("LOWER({}) LIKE LOWER('{}%')", #field_name_str, value));
                    }
                    if let Some(ref value) = filter.ends_with {
                        conditions.push(format!("LOWER({}) LIKE LOWER('%{}')", #field_name_str, value));
                    }
                }
            }
        } else {
            quote! {
            }
        }
    });

    let expanded = quote! {
        impl #struct_name {
            pub fn build_where_clause(&self) -> String {
                let mut conditions = Vec::new();
                #(#field_conditions)*

                if conditions.is_empty() {
                    "".to_string()
                } else {
                    format!(" WHERE {}", conditions.join(" AND "))
                }
            }
        }
    };

    TokenStream::from(expanded)
}
