<?php
/**
 * Plugin Name: Primavera del Libro - CMS
 * Description: Tipos de contenido (Programa, Talleres, Invitados, Galería) y sus campos ACF, expuestos en la API REST para la web headless.
 * Version: 1.1.0
 * Author: Primavera del Libro
 * Requires PHP: 7.0
 *
 * Endpoints (lectura pública):
 *   /wp-json/wp/v2/programa      Eventos del programa
 *   /wp-json/wp/v2/talleres      Talleres
 *   /wp-json/wp/v2/invitados     Invitados
 *   /wp-json/wp/v2/ediciones     Galería: una entrada por año, con su campo "fotos"
 * Usar ?acf_format=standard para recibir las imágenes como objetos (url, tamaños) en vez de IDs.
 *
 * Los datos viven en la base de datos de WordPress: desactivar este plugin no borra nada.
 */

if (!defined('ABSPATH')) {
    exit;
}

/* ---------- Tipos de contenido ---------- */

function pdl_cms_register_cpt($slug, $rest_base, $singular, $plural, $icon, $position, $supports)
{
    register_post_type($slug, array(
        'labels' => array(
            'name'               => $plural,
            'singular_name'      => $singular,
            'menu_name'          => $plural,
            'all_items'          => 'Todos: ' . $plural,
            'add_new'            => 'Añadir nuevo',
            'add_new_item'       => 'Añadir: ' . $singular,
            'edit_item'          => 'Editar: ' . $singular,
            'view_item'          => 'Ver: ' . $singular,
            'search_items'       => 'Buscar en ' . $plural,
            'not_found'          => 'No hay resultados',
            'not_found_in_trash' => 'No hay nada en la papelera',
        ),
        'public'             => false,
        'publicly_queryable' => false,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'show_in_rest'       => true,
        'rest_base'          => $rest_base,
        'menu_icon'          => $icon,
        'menu_position'      => $position,
        'has_archive'        => false,
        'rewrite'            => false,
        'supports'           => $supports,
    ));
}

function pdl_cms_register_types()
{
    pdl_cms_register_cpt('pdl_evento', 'programa', 'Evento del programa', 'Programa', 'dashicons-calendar-alt', 21, array('title'));
    pdl_cms_register_cpt('pdl_taller', 'talleres', 'Taller', 'Talleres', 'dashicons-hammer', 22, array('title', 'page-attributes'));
    pdl_cms_register_cpt('pdl_invitado', 'invitados', 'Invitado', 'Invitados', 'dashicons-groups', 23, array('title', 'page-attributes'));
    pdl_cms_register_cpt('pdl_edicion', 'ediciones', 'Edición (año)', 'Galería', 'dashicons-format-gallery', 24, array('title'));
}
add_action('init', 'pdl_cms_register_types');

/* ---------- Campos ACF ---------- */

function pdl_cms_field($grupo, $type, $name, $label, $extra = array())
{
    return array_merge(array(
        'key'   => 'field_pdl_' . $grupo . '_' . $name,
        'label' => $label,
        'name'  => $name,
        'type'  => $type,
    ), $extra);
}

function pdl_cms_choices($values)
{
    return array_combine($values, $values);
}

function pdl_cms_group($key, $title, $post_type, $fields)
{
    acf_add_local_field_group(array(
        'key'      => 'group_pdl_' . $key,
        'title'    => $title,
        'fields'   => $fields,
        'location' => array(array(array(
            'param'    => 'post_type',
            'operator' => '==',
            'value'    => $post_type,
        ))),
        'position'     => 'acf_after_title',
        'style'        => 'default',
        'show_in_rest' => 1,
    ));
}

function pdl_cms_register_fields()
{
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    $dias = array(
        'jueves'  => 'Jueves 8 (encuentros profesionales)',
        'viernes' => 'Viernes 9',
        'sabado'  => 'Sábado 10',
        'domingo' => 'Domingo 11',
    );

    $destacado = array(
        'ui'           => 1,
        'default_value' => 0,
        'instructions' => 'Si se activa, aparece en la portada del sitio.',
    );

    // Programa
    pdl_cms_group('evento', 'Datos del evento', 'pdl_evento', array(
        pdl_cms_field('evento', 'select', 'dia', 'Día', array('choices' => $dias, 'required' => 1, 'return_format' => 'value')),
        pdl_cms_field('evento', 'text', 'hora', 'Hora', array('placeholder' => '11:00', 'instructions' => 'Formato 24 horas, por ejemplo 11:00 o 16:30.', 'required' => 1)),
        pdl_cms_field('evento', 'text', 'lugar', 'Lugar', array('placeholder' => 'Escenario principal')),
        pdl_cms_field('evento', 'text', 'tipo', 'Tipo de actividad', array('placeholder' => 'Lanzamiento, Conversación, Cuentacuentos...')),
        pdl_cms_field('evento', 'text', 'participantes', 'Participantes'),
        pdl_cms_field('evento', 'text', 'organiza', 'Organiza'),
        pdl_cms_field('evento', 'textarea', 'descripcion', 'Descripción (opcional)', array('rows' => 3)),
        pdl_cms_field('evento', 'true_false', 'destacado', 'Destacado', $destacado),
        pdl_cms_field('evento', 'text', 'clave', 'Clave de sincronización', array('instructions' => 'La rellena la sincronización con la hoja de cálculo. No editar.', 'readonly' => 1)),
    ));

    // Talleres
    pdl_cms_group('taller', 'Datos del taller', 'pdl_taller', array(
        pdl_cms_field('taller', 'textarea', 'descripcion', 'Descripción', array('rows' => 3)),
        pdl_cms_field('taller', 'select', 'dia', 'Día', array('choices' => $dias, 'allow_null' => 1, 'return_format' => 'value')),
        pdl_cms_field('taller', 'text', 'hora', 'Hora', array('placeholder' => '11:00')),
        pdl_cms_field('taller', 'text', 'a_cargo', 'A cargo de'),
        pdl_cms_field('taller', 'text', 'duracion', 'Duración', array('placeholder' => '90 min')),
        pdl_cms_field('taller', 'text', 'lugar', 'Lugar', array('placeholder' => 'Taller de oficios')),
        pdl_cms_field('taller', 'text', 'publico', 'Público', array('placeholder' => 'Desde 12 años')),
        pdl_cms_field('taller', 'text', 'cupos', 'Cupos', array('placeholder' => '20 cupos')),
        pdl_cms_field('taller', 'true_false', 'destacado', 'Destacado', $destacado),
        pdl_cms_field('taller', 'text', 'clave', 'Clave de sincronización', array('instructions' => 'La rellena la sincronización con la hoja de cálculo. No editar.', 'readonly' => 1)),
    ));

    // Invitados
    pdl_cms_group('invitado', 'Datos del invitado', 'pdl_invitado', array(
        pdl_cms_field('invitado', 'image', 'foto', 'Foto', array('return_format' => 'array', 'preview_size' => 'medium', 'library' => 'all')),
        pdl_cms_field('invitado', 'select', 'tipo', 'Categoría', array(
            'choices'       => pdl_cms_choices(array('Autores/as', 'Poetas', 'Ilustradores/as', 'Editores/as', 'Infancia')),
            'return_format' => 'value',
        )),
        pdl_cms_field('invitado', 'text', 'rol', 'Rol', array('placeholder' => 'Autora · Narrativa')),
        pdl_cms_field('invitado', 'text', 'pais', 'País', array('placeholder' => 'Chile')),
        pdl_cms_field('invitado', 'textarea', 'bio', 'Biografía breve', array('rows' => 4)),
        pdl_cms_field('invitado', 'text', 'actividad', 'Actividad en la feria', array('placeholder' => 'Vie 9 · 12:30 · Sala de charlas')),
        pdl_cms_field('invitado', 'true_false', 'destacado', 'Destacado', $destacado),
    ));

    // Galería (una entrada por año; el título es el año, por ejemplo "2025")
    pdl_cms_group('edicion', 'Fotos de la edición', 'pdl_edicion', array(
        pdl_cms_field('edicion', 'gallery', 'fotos', 'Fotos', array(
            'return_format' => 'array',
            'preview_size'  => 'medium',
            'library'       => 'all',
            'insert'        => 'append',
        )),
    ));
}
add_action('acf/init', 'pdl_cms_register_fields');

/* ---------- Aviso si falta ACF ---------- */

function pdl_cms_acf_notice()
{
    if (function_exists('acf_add_local_field_group') || !current_user_can('activate_plugins')) {
        return;
    }
    echo '<div class="notice notice-warning"><p><strong>Primavera del Libro - CMS:</strong> necesita Advanced Custom Fields activo para mostrar los campos.</p></div>';
}
add_action('admin_notices', 'pdl_cms_acf_notice');
