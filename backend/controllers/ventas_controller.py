def construir_filtros(where, params, year=None, region=None, category=None):
    if year:
        where.append("dt.year = %s")
        params.append(year)
    if region:
        where.append("dg.region = %s")
        params.append(region)
    if category:
        where.append("dp.category = %s")
        params.append(category)


def ventas_por_producto(conn, year=None, region=None, category=None):
    cursor = conn.cursor(dictionary=True)
    where = []
    params = []

    construir_filtros(where, params, year, region, category)
    where_clause = "WHERE " + " AND ".join(where) if where else ""

    query = f"""
        SELECT dp.product_name, SUM(fs.sales) AS total_ventas, SUM(fs.profit) AS total_ganancia
        FROM fact_sales fs
        JOIN dim_product dp ON fs.product_id = dp.product_id
        JOIN dim_customer dc ON fs.customer_id = dc.customer_id
        JOIN dim_geografia dg ON dc.geo_id = dg.geo_id
        JOIN dim_time dt ON fs.time_id = dt.time_id
        {where_clause}
        GROUP BY dp.product_name
        ORDER BY total_ventas DESC
        LIMIT 50
    """
    cursor.execute(query, params)
    return cursor.fetchall()


def ventas_por_cliente(conn, year=None, region=None):
    cursor = conn.cursor(dictionary=True)
    where = []
    params = []

    construir_filtros(where, params, year, region, None)
    where_clause = "WHERE " + " AND ".join(where) if where else ""

    query = f"""
        SELECT dc.customer_name, SUM(fs.sales) AS total_ventas, SUM(fs.profit) AS total_ganancia
        FROM fact_sales fs
        JOIN dim_customer dc ON fs.customer_id = dc.customer_id
        JOIN dim_geografia dg ON dc.geo_id = dg.geo_id
        JOIN dim_time dt ON fs.time_id = dt.time_id
        {where_clause}
        GROUP BY dc.customer_name
        ORDER BY total_ventas DESC
        LIMIT 50
    """
    cursor.execute(query, params)
    return cursor.fetchall()


def ventas_por_tiempo(conn, region=None, category=None):
    cursor = conn.cursor(dictionary=True)
    where = []
    params = []

    construir_filtros(where, params, None, region, category)
    where_clause = "WHERE " + " AND ".join(where) if where else ""

    query = f"""
        SELECT dt.year, dt.month, SUM(fs.sales) AS total_ventas
        FROM fact_sales fs
        JOIN dim_time dt ON fs.time_id = dt.time_id
        JOIN dim_customer dc ON fs.customer_id = dc.customer_id
        JOIN dim_geografia dg ON dc.geo_id = dg.geo_id
        JOIN dim_product dp ON fs.product_id = dp.product_id
        {where_clause}
        GROUP BY dt.year, dt.month
        ORDER BY dt.year, dt.month
    """
    cursor.execute(query, params)
    return cursor.fetchall()


def ventas_por_region(conn, year=None, category=None):
    cursor = conn.cursor(dictionary=True)
    where = []
    params = []

    construir_filtros(where, params, year, None, category)
    where_clause = "WHERE " + " AND ".join(where) if where else ""

    query = f"""
        SELECT dg.region, SUM(fs.sales) AS total_ventas
        FROM fact_sales fs
        JOIN dim_customer dc ON fs.customer_id = dc.customer_id
        JOIN dim_geografia dg ON dc.geo_id = dg.geo_id
        JOIN dim_time dt ON fs.time_id = dt.time_id
        JOIN dim_product dp ON fs.product_id = dp.product_id
        {where_clause}
        GROUP BY dg.region
        ORDER BY total_ventas DESC
    """
    cursor.execute(query, params)
    return cursor.fetchall()
