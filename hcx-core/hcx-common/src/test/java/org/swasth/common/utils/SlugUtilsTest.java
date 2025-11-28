package org..common.utils;

import org.junit.Assert;
import org.junit.Test;

public class SlugUtilsTest {

    @Test
    public void testMakeSlug() {
        String sluggified =  SlugUtils.makeSlug("settlements@hospital.com" , "", ".", "-hcx");
        Assert.assertEquals("settlements.hospital@-hcx", sluggified);
    }

}
